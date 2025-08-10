
'use client';

import { useState } from 'react';
import { MoreHorizontal, FileDown, FileUp, PlusCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock Data
const members = [
  { id: "MEM-001", name: "John Doe", email: "john.d@example.com", joinDate: "2023-01-15", status: "Active" },
  { id: "MEM-002", name: "Jane Smith", email: "jane.s@example.com", joinDate: "2023-02-20", status: "Active" },
  { id: "MEM-003", name: "Peter Jones", email: "peter.j@example.com", joinDate: "2023-03-10", status: "Suspended" },
  { id: "MEM-004", name: "Mary Williams", email: "mary.w@example.com", joinDate: "2023-04-05", status: "Resigned" },
  { id: "MEM-005", name: "David Brown", email: "david.b@example.com", joinDate: "2023-05-22", status: "Active" },
];

export function AllMembersTab() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Members</CardTitle>
        <CardDescription>A list of all members in the cooperative.</CardDescription>
        <div className="flex items-center gap-4 pt-4">
            <Input 
                placeholder="Filter members..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Member
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.id}</TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.joinDate}</TableCell>
                <TableCell>
                  <Badge variant={member.status === 'Active' ? 'default' : member.status === 'Suspended' ? 'destructive' : 'secondary'}>
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View/Edit Profile</DropdownMenuItem>
                      <DropdownMenuItem>Change Status</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
