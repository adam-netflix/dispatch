import PluginApi from "@/plugin/api"

import { getField, updateField } from "vuex-map-fields"
import { debounce } from "lodash"

const getDefaultSelectedState = () => {
  return {
    id: null,
    title: null,
    slug: null,
    description: null,
    version: null,
    author: null,
    author_url: null,
    enabled: null,
    type: null,
    required: null,
    multiple: null,
    configuration: null,
    loading: false
  }
}

const state = {
  selected: {
    ...getDefaultSelectedState()
  },
  dialogs: {
    showEdit: false
  },
  table: {
    rows: {
      items: [],
      total: null
    },
    options: {
      q: "",
      page: 1,
      itemsPerPage: 10,
      sortBy: ["slug"],
      descending: [true]
    },
    loading: false
  }
}

const getters = {
  getField
}

const actions = {
  getAll: debounce(({ commit, state }) => {
    commit("SET_TABLE_LOADING", "primary")
    return PluginApi.getAll(state.table.options)
      .then(response => {
        commit("SET_TABLE_LOADING", false)
        commit("SET_TABLE_ROWS", response.data)
      })
      .catch(() => {
        commit("SET_TABLE_LOADING", false)
      })
  }, 200),
  editShow({ commit }, plugin) {
    commit("SET_DIALOG_EDIT", true)
    if (plugin) {
      commit("SET_SELECTED", plugin)
    }
  },
  closeEdit({ commit }) {
    commit("SET_DIALOG_EDIT", false)
    commit("RESET_SELECTED")
  },
  save({ commit, dispatch }) {
    if (!state.selected.id) {
      return PluginApi.create(state.selected)
        .then(() => {
          dispatch("closeEdit")
          dispatch("getAll")
          commit(
            "notification_backend/addBeNotification",
            { text: "Plugin created successfully.", type: "success" },
            { root: true }
          )
        })
        .catch(err => {
          commit(
            "notification_backend/addBeNotification",
            {
              text: "Plugin not created. Reason: " + err.response.data.detail,
              type: "error"
            },
            { root: true }
          )
        })
    } else {
      return PluginApi.update(state.selected.id, state.selected)
        .then(() => {
          dispatch("closeEdit")
          dispatch("getAll")
          commit(
            "notification_backend/addBeNotification",
            { text: "Plugin updated successfully.", type: "success" },
            { root: true }
          )
        })
        .catch(err => {
          commit(
            "notification_backend/addBeNotification",
            {
              text: "Plugin not updated. Reason: " + err.response.data.detail,
              type: "error"
            },
            { root: true }
          )
        })
    }
  },
  remove({ commit, dispatch }) {
    return PluginApi.delete(state.selected.id)
      .then(function() {
        dispatch("closeRemove")
        dispatch("getAll")
        commit(
          "notification_backend/addBeNotification",
          { text: "Plugin deleted successfully.", type: "success" },
          { root: true }
        )
      })
      .catch(err => {
        commit(
          "notification_backend/addBeNotification",
          {
            text: "Plugin not deleted. Reason: " + err.response.data.detail,
            type: "error"
          },
          { root: true }
        )
      })
  }
}

const mutations = {
  updateField,
  SET_SELECTED(state, value) {
    state.selected = Object.assign(state.selected, value)
  },
  SET_TABLE_LOADING(state, value) {
    state.table.loading = value
  },
  SET_TABLE_ROWS(state, value) {
    state.table.rows = value
  },
  SET_DIALOG_EDIT(state, value) {
    state.dialogs.showEdit = value
  },
  RESET_SELECTED(state) {
    state.selected = Object.assign(state.selected, getDefaultSelectedState())
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
