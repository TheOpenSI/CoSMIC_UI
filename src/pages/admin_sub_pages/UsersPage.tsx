/// --- Core libraries --- ///
import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import {
  Trash2,
  UserRoundPlus
} from "lucide-react";
import {
  Button,
  Dropdown,
  Input,
  message,
  Modal,
  Select,
  Spin,
  Tag,
} from "antd";
import Table from "antd/es/table/Table";
import dayjs from "dayjs";
import { useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";


/// --- Type hints --- ///
import type { User } from "../../types/users";
import type { Role } from "../../types/roles";


/// --- Internal libraries --- ///
import {
  deleteOneUser,
  getAllUsers,
  updateUserRole
} from "../../api/users";
import { getAllRoles } from "../../api/roles";



export default function UsersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: getAllRoles,
  });

  const { mutate: handleDelete } = useMutation({
    mutationFn: (id: string) => deleteOneUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      message.success("User deleted!");
    },
    onError: () => {
      message.error("Delete failed");
    },
  });

  const { mutate: handleRoleUpdate } = useMutation({
    mutationFn: (
      {
        userId,
        roleId
      }:
        {
          userId: string;
          roleId: string
        }
    ) => updateUserRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      message.success("Role updated!");
    },
    onError: () => {
      message.error("Role update failed");
    },
  });

  // TODO:
  // const { mutate: handleCreate } = useMutation({
  //   mutationFn: () => createOneUser({ name, email, password, role }),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["users"] });
  //     message.success("User created!");
  //     handleModalCancel();
  //   },
  //   onError: () => {
  //     message.error("Create failed");
  //   },
  // });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (
        _: string,
        record: User
      ) => {
        // Store all available roles for dropdown selection
        const items = roles?.result?.map(
          (role) => ({
            key: role.id,
            label: role.name,
            onClick: () =>
              handleRoleUpdate({
                userId: record.id,
                roleId: role.id,
              }),
          })
        );
        // Match role ID from fetched role data (Roles API) to role ID associated
        // with user from fetched user data (Users API)
        const userRole: Role | undefined = roles?.result?.find(role => role.id === record.role_id);

        // Check for whether user with associated role ID is an 'Admin' or not,
        // which UI design rendered will differ
        const isAdmin: boolean = userRole?.name === "admin";

        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Tag color={isAdmin ? "green" : "blue"} className="cursor-pointer">
              {userRole?.name || null}
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: "Created at",
      dataIndex: "created_at",
      render: (date: string) => dayjs(date).format("DD MMM YYYY, HH:mm"),
    },
    {
      title: "Action",
      render: (_: unknown, record: User) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<Trash2 size={13} />}
          onClick={() => handleDelete(record.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <div className="text-3xl font-bold">Users Information</div>
        <div>View, update role, and delete users</div>
      </div>
      <div className=" flex flex-col gap-1 mt-3">
        <div className="flex justify-between ">
          <div>
            Total users count:{" "}
            <span className="text-[#0079FF]">{data?.count}</span>
          </div>
        </div>
      </div>
      <div>
        {isLoading ? (
          <div className="flex justify-center py-14">
            <Spin indicator={<LoadingOutlined spin />} size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={data?.result}
            rowKey="id"
            pagination={
              data?.count && data.count > 10
                ? { pageSize: 10, total: data.count }
                : false
            }
          />
        )}
      </div>
    </div>
  );
}
