import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const settingsApi = createApi({
    reducerPath: "settingsApi",
    baseQuery: baseQuery('settings'),
    refetchOnMountOrArgChange: 30,
    endpoints: (builder) => ({
        applynewsettings: builder.mutation({
            query: ({ id, settingsValue }) => ({
                url: `/applynewsettings/${id}`,
                method: "POST",
                body: settingsValue
            })
        }),
        getSettingsData: builder.query({
            query: ({ id }) => ({
                url: `/getsettingsdata/${id}`,
                method: "GET"
            })
        }),
    })
});

export const {
    useApplynewsettingsMutation,
    useGetSettingsDataQuery
} = settingsApi;