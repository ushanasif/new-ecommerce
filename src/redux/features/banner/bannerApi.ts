/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from '../../api/baseApi';
import type { BannerApiResponse } from './banner.types';

export const bannerApi = baseApi.injectEndpoints({

  endpoints: (builder) => ({

     getBanner: builder.query<BannerApiResponse, void>({
          query: () => "/banner",
          providesTags: ["Banner"],
        }),

      deleteBanner: builder.mutation<any, string>({
            query: (id) => ({
              url: `/banner/${id}`,
              method: "DELETE",
            }),
            invalidatesTags: ["Banner"],
          }),
    
  }),
});

export const { useGetBannerQuery, useDeleteBannerMutation } = bannerApi;
