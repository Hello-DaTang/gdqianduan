import { addHomeDevice, getHomeDevice, updateHomeDevice } from '@/api/home'

const state = {
  homeDevices: [],
  currentDevice: null
}

const mutations = {
  SET_HOME_DEVICES: (state, devices) => {
    state.homeDevices = devices
  },
  ADD_HOME_DEVICE: (state, device) => {
    state.homeDevices.push(device)
  },
  SET_CURRENT_DEVICE: (state, device) => {
    state.currentDevice = device
  },
  UPDATE_HOME_DEVICE: (state, updatedDevice) => {
    const index = state.homeDevices.findIndex(item => item.id === updatedDevice.id)
    if (index !== -1) {
      state.homeDevices.splice(index, 1, updatedDevice)
    }
  }
}

const actions = {
  // 添加家居设备
  addDevice({ commit }, deviceData) {
    return new Promise((resolve, reject) => {
      addHomeDevice(deviceData)
        .then(response => {
          if (deviceData.id) {
            commit('UPDATE_HOME_DEVICE', deviceData)
          } else {
            commit('ADD_HOME_DEVICE', {
              ...deviceData,
              id: new Date().getTime() // 临时ID，实际应从后端获取
            })
          }
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 获取家居设备
  getDevice({ commit }, id) {
    return new Promise((resolve, reject) => {
      getHomeDevice(id)
        .then(response => {
          const { data } = response
          commit('SET_CURRENT_DEVICE', data)
          resolve(data)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 更新家居设备
  updateDevice({ commit }, deviceData) {
    return new Promise((resolve, reject) => {
      updateHomeDevice(deviceData)
        .then(response => {
          commit('UPDATE_HOME_DEVICE', deviceData)
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
