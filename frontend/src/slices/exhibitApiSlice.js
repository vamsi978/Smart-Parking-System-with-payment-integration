import { apiSlice } from './apiSlice';
import { EXHIBITS_URL } from '../constants';

export const exhibitsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getExhibits: builder.query({
            query: () => ({
              url: '/api/admin/exhibits',
              method:'GET', 
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Exhibits'],
            onSuccess: (response) => {
              console.log('Successful Response:', response);
            },
            onError: (error) => {
              console.log("ERROR");
              console.error('Error Response:', error);
            },
          }),
          getExhibitDetails: builder.query({
            query: (exhibitId) => ({
              url: `${EXHIBITS_URL}/${exhibitId}`,
            }),
            keepUnusedDataFor: 5,
          }),
          createExhibit: builder.mutation({
            query: () => ({
              url: `${EXHIBITS_URL}`,
              method: 'POST',
            }),
            invalidatesTags: ['Exhibit'],
          }),
          updateExhibit: builder.mutation({
            query: (data) => ({
              url: `${EXHIBITS_URL}/${data.ExhibitId}`,
              method: 'PUT',
              body: data,
            }),
            invalidatesTags: ['Exhibits'],
          }),
    }),
});


export const {
    useGetExhibitsQuery,
    useGetExhibitDetailsQuery,
    useCreateExhibitMutation,
    useUpdateExhibitMutation,
    // useUploadExhibitImageMutation,
    // useDeleteExhibitMutation,
    // useCreateReviewMutation,
    // useGetTopExhibitsQuery,
} = exhibitsApiSlice;