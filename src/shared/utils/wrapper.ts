import { TPaginationMeta } from '@shared/types/pagination-meta.type';
import {
  TResponse,
  TResponseList,
  TResponsePagination,
} from '@shared/types/response.type';

export type WrapperData<T> = {
  data: T | null;
  error: null | Error;
};
export const data = <T>(data: T): WrapperData<T> => ({
  error: null,
  data,
});

export type WrapperPaginationData<T> = WrapperData<T> & {
  meta: TPaginationMeta;
};
export const paginationData = <T>(
  data: T,
  meta: TPaginationMeta,
): WrapperPaginationData<T> => ({
  error: null,
  data,
  meta,
});

export type WrapperError = {
  data: null;
  error: Error;
};
export const error = (error: Error): WrapperError => ({
  error,
  data: null,
});

export type WrapperResponseParams<T> = Omit<TResponse<T>, 'statusCode'> & {
  statusCode?: number;
};
export const response = <T>(params: WrapperResponseParams<T>): TResponse<T> => {
  const { statusCode = 200, data = undefined, message } = params;
  return {
    statusCode,
    data,
    message,
  };
};

export type WrapperPaginationResponseParams<T> = Omit<
  TResponsePagination<T>,
  'statusCode' | 'data'
> & {
  statusCode?: number;
  data: T[];
  count: number;
};
export const paginationResponse = <T>(
  params: WrapperPaginationResponseParams<T>,
): TResponsePagination<T> => {
  const { statusCode = 200, data = [], message } = params;

  const meta: TPaginationMeta = {
    totalAllData: params.count,
    totalView: data.length,
    maxView: data.length,
    currentPage: 1,
    totalPage: 1,
  };

  return {
    statusCode,
    data: {
      meta,
      items: data,
    },
    message,
  };
};

export type WrapperListResponseParams<T> = Omit<
  TResponseList<T>,
  'statusCode' | 'data'
> & {
  statusCode?: number;
  data: T[];
  total: number;
};

export const listResponse = <T>(
  params: WrapperListResponseParams<T>,
): TResponseList<T> => {
  const { statusCode = 200, data = [], message, total } = params;

  return {
    statusCode,
    data: {
      items: data,
      total,
    },
    message,
  };
};
