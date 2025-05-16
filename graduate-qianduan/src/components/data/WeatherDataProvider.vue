<template>
  <!-- 这是一个逻辑组件，不渲染任何UI内容 -->
  <slot></slot>
</template>

<script>
import { ref, computed, onMounted, provide } from 'vue'
import { useStore } from 'vuex'
import { simplifyWeatherData } from '@/utils/weatherUtils'

export default {
  setup() {
    const store = useStore();
    const loading = ref(false);
    
    // 天气数据
    const weatherData = computed(() => store.state.weather.weatherData);
    
    // 获取完整天气数据
    const fetchWeather = async (forceRefresh = false) => {
      try {
        loading.value = true;
        await store.dispatch('weather/fetchWeather', { force: forceRefresh });
        return weatherData.value;
      } catch (error) {
        console.error('获取天气数据失败:', error);
        throw error;
      } finally {
        loading.value = false;
      }
    };
    
    // 获取精简版天气数据（只返回12小时）
    const fetchSimplifiedWeather = async (forceRefresh = false) => {
      try {
        loading.value = true;
        await store.dispatch('weather/fetchWeather', { force: forceRefresh });
        return simplifyWeatherData(weatherData.value);
      } catch (error) {
        console.error('获取精简天气数据失败:', error);
        throw error;
      } finally {
        loading.value = false;
      }
    };
    
    // 在组件挂载时预加载数据
    onMounted(async () => {
      try {
        await store.dispatch('weather/fetchWeather')
      } catch (error) {
        console.error('预加载天气数据失败:', error)
      }
    })
    
    // 提供数据和方法给子组件
    provide('weatherData', weatherData)
    provide('weatherLoading', loading)
    provide('fetchWeather', fetchWeather)
    provide('fetchSimplifiedWeather', fetchSimplifiedWeather)
    
    return {
      weatherData,
      loading,
      fetchWeather,
      fetchSimplifiedWeather
    };
  }
}
</script>
