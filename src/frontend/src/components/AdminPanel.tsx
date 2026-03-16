import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { backendInterface } from "../backend";

interface AdminPanelProps {
  token: string;
  onBack: () => void;
  actor: backendInterface | null;
}

export default function AdminPanel({ token, onBack, actor }: AdminPanelProps) {
  const [users, setUsers] = useState<string[]>([]);
  const [topTools, setTopTools] = useState<Array<[string, bigint]>>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTools, setLoadingTools] = useState(true);

  useEffect(() => {
    if (!actor) return;
    Promise.all([
      actor
        .listUsers(token)
        .then((u) => {
          setUsers(u);
          setLoadingUsers(false);
        })
        .catch(() => setLoadingUsers(false)),
      actor
        .getTopTools()
        .then((t) => {
          setTopTools(t);
          setLoadingTools(false);
        })
        .catch(() => setLoadingTools(false)),
    ]);
  }, [actor, token]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          data-ocid="admin.back_button"
          className="gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">System management</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger
            value="users"
            data-ocid="admin.users_tab"
            className="gap-2"
          >
            <Users size={14} />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            data-ocid="admin.stats_tab"
            className="gap-2"
          >
            <BarChart3 size={14} />
            Tool Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="border rounded-xl overflow-hidden">
            {loadingUsers ? (
              <div className="p-6 space-y-3" data-ocid="admin.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="admin.users.empty_state"
                      >
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user, i) => (
                      <TableRow
                        key={user}
                        data-ocid={`admin.users.row.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">{user}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="border rounded-xl overflow-hidden">
            {loadingTools ? (
              <div className="p-6 space-y-3" data-ocid="admin.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <Table data-ocid="admin.stats.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Tool</TableHead>
                    <TableHead className="text-right">Uses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topTools.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="admin.stats.empty_state"
                      >
                        No usage data yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    topTools.map(([toolId, count], i) => (
                      <TableRow
                        key={toolId}
                        data-ocid={`admin.stats.row.${i + 1}`}
                      >
                        <TableCell>
                          <span
                            className={`font-bold text-sm ${
                              i === 0
                                ? "text-yellow-500"
                                : i === 1
                                  ? "text-slate-400"
                                  : i === 2
                                    ? "text-amber-600"
                                    : "text-muted-foreground"
                            }`}
                          >
                            #{i + 1}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{toolId}</TableCell>
                        <TableCell className="text-right font-mono">
                          <Badge variant="outline">{count.toString()}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
