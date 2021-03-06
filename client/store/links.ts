import { action, Action, thunk, Thunk } from "easy-peasy";
import axios from "axios";
import query from "query-string";

import { getAxiosConfig } from "../utils";
import { API, APIv2 } from "../consts";

export interface Link {
  id: number;
  address: string;
  banned: boolean;
  banned_by_id?: number;
  created_at: string;
  link: string;
  domain?: string;
  domain_id?: number;
  password?: string;
  target: string;
  updated_at: string;
  user_id?: number;
  visit_count: number;
}

export interface NewLink {
  target: string;
  customurl?: string;
  password?: string;
  domain?: string;
  reuse?: boolean;
  reCaptchaToken?: string;
}

export interface LinksQuery {
  limit: string;
  skip: string;
  search: string;
  all: boolean;
}

export interface LinksListRes {
  data: Link[];
  total: number;
  limit: number;
  skip: number;
}

export interface Links {
  link?: Link;
  items: Link[];
  total: number;
  loading: boolean;
  submit: Thunk<Links, NewLink>;
  get: Thunk<Links, LinksQuery>;
  add: Action<Links, Link>;
  set: Action<Links, LinksListRes>;
  deleteOne: Thunk<Links, { id: string; domain?: string }>;
  setLoading: Action<Links, boolean>;
}

export const links: Links = {
  link: null,
  items: [],
  total: 0,
  loading: true,
  submit: thunk(async (actions, payload) => {
    const data = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== "")
    );
    const res = await axios.post(APIv2.Links, data, getAxiosConfig());
    actions.add(res.data);
    return res.data;
  }),
  get: thunk(async (actions, payload) => {
    actions.setLoading(true);
    const res = await axios.get(
      `${APIv2.Links}?${query.stringify(payload)}`,
      getAxiosConfig()
    );
    actions.set(res.data);
    actions.setLoading(false);
    return res.data;
  }),
  deleteOne: thunk(async (actions, payload) => {
    await axios.post(API.DELETE_LINK, payload, getAxiosConfig());
  }),
  add: action((state, payload) => {
    state.items.pop();
    state.items.unshift(payload);
  }),
  set: action((state, payload) => {
    state.items = payload.data;
    state.total = payload.total;
  }),
  setLoading: action((state, payload) => {
    state.loading = payload;
  })
};
