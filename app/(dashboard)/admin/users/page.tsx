"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers, User } from "@/hooks/useUsers";
import {
  createUserSchema,
  updateUserSchema,
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/userSchemas";

type FormErrors = Partial<Record<keyof CreateUserInput | "form", string>>;

export default function UsersPage() {
  const { users, loading, error, createUser, updateUser, deleteUser } =
    useUsers();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Create form state
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    role: "officer" as "admin" | "officer",
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    email: "",
    password: "",
    role: "officer" as "admin" | "officer",
  });

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const resetCreateForm = () => {
    setCreateForm({ email: "", password: "", role: "officer" });
    setFormErrors({});
  };

  const resetEditForm = () => {
    setEditForm({ email: "", password: "", role: "officer" });
    setFormErrors({});
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validate with Zod
    const result = createUserSchema.safeParse(createForm);
    if (!result.success) {
      const errors: FormErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof CreateUserInput;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const response = await createUser(result.data);
    setIsSubmitting(false);

    if (response.success) {
      setIsCreateOpen(false);
      resetCreateForm();
    } else {
      setFormErrors({ form: response.error });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormErrors({});

    // Validate with Zod
    const result = updateUserSchema.safeParse(editForm);
    if (!result.success) {
      const errors: FormErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof UpdateUserInput;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const response = await updateUser(editingUser.id, result.data);
    setIsSubmitting(false);

    if (response.success) {
      setIsEditOpen(false);
      setEditingUser(null);
      resetEditForm();
    } else {
      setFormErrors({ form: response.error });
    }
  };

  const handleDelete = async (userId: number) => {
    const response = await deleteUser(userId);
    if (!response.success) {
      console.error("Delete failed:", response.error);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      password: "",
      role: user.role,
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  // Reset forms when dialogs close
  useEffect(() => {
    if (!isCreateOpen) resetCreateForm();
  }, [isCreateOpen]);

  useEffect(() => {
    if (!isEditOpen) {
      resetEditForm();
      setEditingUser(null);
    }
  }, [isEditOpen]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage administrator and officer accounts.
          </p>
        </div>

        {/* Create User Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new account for system access.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                {formErrors.form && (
                  <Alert variant="destructive">
                    <AlertDescription>{formErrors.form}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-2">
                  <label htmlFor="create-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="email@example.com"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                  />
                  {formErrors.email && (
                    <p className="text-sm text-destructive">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="create-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </label>
                  <Input
                    id="create-password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                  />
                  {formErrors.password && (
                    <p className="text-sm text-destructive">
                      {formErrors.password}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="create-role" className="text-sm font-medium">
                    Role
                  </label>
                  <Select
                    value={createForm.role}
                    onValueChange={(value: "admin" | "officer") =>
                      setCreateForm({ ...createForm, role: value })
                    }
                  >
                    <SelectTrigger id="create-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="officer">Officer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create User
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 max-w-sm px-0.5">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Email</TableHead>
                <TableHead className="hidden md:table-cell px-4">
                  Role
                </TableHead>
                <TableHead className="hidden lg:table-cell px-4">
                  Created At
                </TableHead>
                <TableHead className="text-right px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <p className="text-muted-foreground">No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium py-3 px-4">
                      {user.email}
                      <div className="md:hidden mt-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize"
                        >
                          {user.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell capitalize py-3 px-4">
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                        className="font-medium"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground py-3 px-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right py-3 px-4">
                      <div className="flex justify-end gap-2">
                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        {/* Delete Button with Confirmation */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <strong>{user.email}</strong>? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave password blank to keep unchanged.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              {formErrors.form && (
                <Alert variant="destructive">
                  <AlertDescription>{formErrors.form}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2">
                <label htmlFor="edit-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="email@example.com"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-password" className="text-sm font-medium">
                  New Password (optional)
                </label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Leave blank to keep unchanged"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                />
                {formErrors.password && (
                  <p className="text-sm text-destructive">
                    {formErrors.password}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-role" className="text-sm font-medium">
                  Role
                </label>
                <Select
                  value={editForm.role}
                  onValueChange={(value: "admin" | "officer") =>
                    setEditForm({ ...editForm, role: value })
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="officer">Officer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
