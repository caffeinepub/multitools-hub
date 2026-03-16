import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    username : Text;
    role : Text; // "user" or "admin"
  };

  type SessionToken = Text;

  type UserCredentials = {
    username : Text;
    passwordHash : Text;
  };

  let userCredentials = Map.empty<Principal, UserCredentials>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let sessions = Map.empty<SessionToken, Principal>();
  let toolUsage = Map.empty<Text, Nat>();
  var sessionCounter : Nat = 0;

  func hashPassword(password : Text) : Text {
    Text.fromIter(password.chars().reverse());
  };

  func generateToken(principal : Principal) : SessionToken {
    sessionCounter += 1;
    principal.toText() # "-" # sessionCounter.toText();
  };

  func getPrincipalFromToken(token : SessionToken) : ?Principal {
    sessions.get(token);
  };

  public shared ({ caller }) func register(username : Text, password : Text) : async Text {
    switch (userCredentials.get(caller)) {
      case (?_) { return "Error: User already registered" };
      case (null) {};
    };

    if (username.size() == 0) {
      return "Error: Username cannot be empty";
    };
    if (password.size() < 4) {
      return "Error: Password must be at least 4 characters";
    };

    let credentials : UserCredentials = {
      username;
      passwordHash = hashPassword(password);
    };
    userCredentials.add(caller, credentials);

    let profile : UserProfile = {
      username;
      role = "user";
    };
    userProfiles.add(caller, profile);

    "ok";
  };

  public shared ({ caller }) func login(username : Text, password : Text) : async Text {
    switch (userCredentials.get(caller)) {
      case (null) { return "Error: User not found" };
      case (?credentials) {
        if (credentials.username != username) {
          return "Error: Invalid username";
        };
        if (credentials.passwordHash != hashPassword(password)) {
          return "Error: Invalid password";
        };

        let token = generateToken(caller);
        sessions.add(token, caller);
        token;
      };
    };
  };

  public shared ({ caller }) func logout(token : SessionToken) : async () {
    switch (getPrincipalFromToken(token)) {
      case (?principal) {
        if (principal == caller) {
          sessions.remove(token);
          return;
        };
      };
      case (null) {};
    };
  };

  public query ({ caller }) func getProfile(token : SessionToken) : async ?{ username : Text; role : Text } {
    switch (getPrincipalFromToken(token)) {
      case (null) { null };
      case (?principal) {
        if (principal != caller) {
          return null;
        };
        switch (userProfiles.get(principal)) {
          case (null) { null };
          case (?profile) {
            ?{ username = profile.username; role = profile.role };
          };
        };
      };
    };
  };

  public query ({ caller }) func isAdmin(token : SessionToken) : async Bool {
    switch (getPrincipalFromToken(token)) {
      case (null) { false };
      case (?principal) {
        principal == caller and AccessControl.isAdmin(accessControlState, principal);
      };
    };
  };

  public query ({ caller }) func listUsers(token : SessionToken) : async [Text] {
    switch (getPrincipalFromToken(token)) {
      case (null) {
        Runtime.trap("Unauthorized: Invalid token");
      };
      case (?principal) {
        if (principal != caller) {
          Runtime.trap("Unauthorized: Token mismatch");
        };

        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only admins can list users");
        };

        userProfiles.entries().map(func((_, profile)) { profile.username }).toArray();
      };
    };
  };

  public shared func recordUsage(toolId : Text) : async () {
    switch (toolUsage.get(toolId)) {
      case (null) {
        toolUsage.add(toolId, 1);
      };
      case (?count) {
        toolUsage.add(toolId, count + 1);
      };
    };
  };

  public query func getTopTools() : async [(Text, Nat)] {
    let entries = toolUsage.entries().toArray();

    let sorted = entries.sort(
      func(a, b) {
        if (a.1 > b.1) { #less } else if (a.1 < b.1) { #greater } else { #equal };
      }
    );

    sorted;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public func getGreeting() : async Text {
    "Hello from the tools backend! Canister is running.";
  };
};
