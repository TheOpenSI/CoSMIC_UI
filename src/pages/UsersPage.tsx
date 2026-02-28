import { Table, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search } from "lucide-react";

interface User {
  key: string;
  name: string;
  email: string;
  role: "Admin" | "User";
  createdAt: string;
  lastActive: string;
}

const columns: ColumnsType<User> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    render: (email: string) => <a href={`mailto:${email}`}>{email}</a>,
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
    render: (role: string) => (
      <Tag color={role === "Admin" ? "green" : "default"}>{role}</Tag>
    ),
  },
  {
    title: "Created at",
    dataIndex: "createdAt",
    key: "createdAt",
  },
  {
    title: "Last Active",
    dataIndex: "lastActive",
    key: "lastActive",
  },
  {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <div className="flex gap-3">
        <Button type="link" className="p-0">
          Make admin
        </Button>
        <Button type="link" danger className="p-0">
          Delete
        </Button>
      </div>
    ),
  },
];

const data: User[] = [
  {
    key: "1",
    name: "smanile",
    email: "smanileee@gmail.com",
    role: "Admin",
    createdAt: "February 17, 2026",
    lastActive: "2 days ago",
  },
];

export default function UsersPage() {
  return (
    <div className="flex flex-col">
      <div className="text-xl font-bold mb-4">Users Information</div>
      <div className="flex justify-between mb-1">
        <div className="mt-4">Total users: 1</div>
        <div className="flex items-center gap-2 bg-[#F0F5F9] rounded-lg px-2 py-1">
          <Search color="#8C8C8C" />
          <input
            type="text"
            placeholder="Search Chats"
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        components={{
          header: {
            cell: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
              <th
                {...props}
                style={{ backgroundColor: "#F0F5F9", ...props.style }}
              />
            ),
          },
        }}
      />
    </div>
  );
}
