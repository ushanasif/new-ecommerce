
import { baseApi } from "../../api/baseApi";
import type { ChangeRolePayload, SearchParams, ShippingFeeData, UsersApiResponse, UserType } from "./admin.types";


const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getAllUsers: builder.query<UsersApiResponse, void>({
      query: () => "/user/get-all-users",
      providesTags: ["User"],
    }),

    getUserBySearch: builder.query<UsersApiResponse, SearchParams>({
      query: ({ searchTerm, role }) => {
        const params = new URLSearchParams();
        if (searchTerm) params.append("searchTerm", searchTerm);
        if (role) params.append("role", role);
        return `/user/get-user-by-search?${params.toString()}`;
      },
    }),

    changeRole: builder.mutation<{ success: boolean; user: UserType }, ChangeRolePayload>({
      query: ({ userId, role }) => ({
        url: "/user/change-role",
        method: "PATCH",
        body: { userId, role },
      }),
      invalidatesTags: ["User"],
    }),

    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/user/delete-user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    getShippingFees: builder.query<ShippingFeeData, void>({
      query: () => '/shipping-fee/get',
      providesTags: ['ShippingFee'],
    }),
    updateShippingFees: builder.mutation<ShippingFeeData, ShippingFeeData>({
      query: (fees) => ({
        url: '/shipping-fee/add',
        method: 'POST',
        body: fees,
      }),
      invalidatesTags: ['ShippingFee'],
    }),

  }),
});

export const { useGetAllUsersQuery, useGetUserBySearchQuery, useChangeRoleMutation, useDeleteUserMutation, useGetShippingFeesQuery, useUpdateShippingFeesMutation } = adminApi;
export default adminApi;
