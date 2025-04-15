<template>
  <modern-page-container title="天气预报">
    <div class="weather-search">
      <modern-card hoverable>
        <div class="search-container">
          <modern-input
            placeholder="请输入城市名称（如：北京市）"
            v-model="searchQuery"
            prefix="el-icon-search"
            class="city-search"
          />
          <modern-button 
            type="primary" 
            text="搜索" 
            @click="searchWeather" 
            :loading="loading"
          />
        </div>
      </modern-card>
    </div>
    
    <loading-indicator v-if="loading" size="large" text="加载天气数据中..." />
    
    <template v-else>
      <!-- 当前天气 -->
      <modern-card title="当前天气" class="weather-card">
        <div class="current-weather">
          <div class="weather-left">
            <div class="weather-icon">
              <img :src="getWeatherIconPath(currentCondition)" alt="天气图标" class="weather-icon-img">
            </div>
            <div class="city-name">{{ cityName }}</div>
          </div>
          
          <div class="weather-details">
            <div class="temp-large">{{ currentTemp }}°C</div>
            <div class="condition">{{ currentCondition }}</div>
            <div class="weather-meta">
              <div class="meta-item">
                <span>{{ windDirection }} {{ windPower }}</span>
              </div>
              <div class="meta-item">
                <span>湿度: {{ humidity }}%</span>
              </div>
              <div class="meta-item">
                <span>体感温度: {{ feelsLike }}°C</span>
              </div>
            </div>
          </div>
          
          <div class="update-time">
            更新时间: {{ updateTime }}
          </div>
        </div>
        
        <div class="weather-quality">
          <div class="quality-item">
            <div class="quality-label">气压</div>
            <div class="quality-value">{{ pressure }} hPa</div>
          </div>
          <div class="quality-item">
            <div class="quality-label">风力等级</div>
            <div class="quality-value">{{ windPower }}</div>
          </div>
          <div class="quality-item">
            <div class="quality-label">降水概率</div>
            <div class="quality-value">{{ precipitation }}%</div>
          </div>
          <div class="quality-item">
            <div class="quality-label">紫外线</div>
            <div class="quality-value">{{ getUVIndexDesc(uvIndex) }}</div>
          </div>
        </div>
      </modern-card>
      
      <!-- 24小时预报 -->
      <modern-card title="未来24小时预报" class="weather-card">
        <div class="time-range">{{ getTimeRangeText() }}</div>
        <div class="hourly-forecast">
          <div class="forecast-scrollable">
            <div 
              v-for="(hour, index) in hourlyForecast" 
              :key="index" 
              class="hourly-item"
              :class="{ 'active-hour': hour.time === '现在' }"
            >
              <div class="hourly-time">{{ hour.time }}</div>
              <div class="hourly-icon">
                <img :src="getWeatherIconPath(hour.condition)" alt="天气图标" class="hourly-icon-img">
              </div>
              <div class="hourly-temp">{{ hour.temp }}°C</div>
              <div class="hourly-condition">{{ hour.condition }}</div>
              <div class="hourly-wind">{{ hour.wind }}</div>
            </div>
          </div>
        </div>
      </modern-card>
      
      <!-- 温度变化趋势 -->
      <modern-card title="24小时温度趋势" class="weather-card">
        <modern-chart 
          :options="chartOptions" 
          height="300px" 
          v-if="hourlyForecast.length > 0"
        />
      </modern-card>
      
      <!-- 详细数据表格 -->
      <modern-card title="详细天气数据" class="weather-card">
        <el-tabs type="border-card">
          <el-tab-pane label="今日">
            <modern-table
              :data="hourlyForecast.slice(0, 12)"
              :columns="hourlyColumns"
              :loading="loading"
              hover
              striped
            />
          </el-tab-pane>
          <el-tab-pane label="明日">
            <modern-table
              :data="hourlyForecast.slice(12)"
              :columns="hourlyColumns"
              :loading="loading"
              hover
              striped
            />
          </el-tab-pane>
        </el-tabs>
      </modern-card>
    </template>
  </modern-page-container>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getWeather } from '@/api/weather' 
import { getUserInfo } from '@/api/user' 
import ModernPageContainer from '@/components/layout/ModernPageContainer.vue'
import ModernCard from '@/components/layout/ModernCard.vue'
import ModernButton from '@/components/ui/ModernButton.vue'
import ModernInput from '@/components/ui/ModernInput.vue'
import ModernTable from '@/components/ui/ModernTable.vue'
import ModernChart from '@/components/charts/ModernChart.vue'
import LoadingIndicator from '@/components/feedback/LoadingIndicator.vue'

export default {
  name: 'WeatherView',
  components: {
    ModernPageContainer,
    ModernCard,
    ModernButton,
    ModernInput,
    ModernTable,
    ModernChart,
    LoadingIndicator
  },
  setup() {
    const loading = ref(false)
    const searchQuery = ref('沈阳市')
    const cityName = ref('沈阳市')
    const currentTemp = ref('-')
    const currentCondition = ref('-')
    const windDirection = ref('-')
    const windPower = ref('-')
    const humidity = ref('-')
    const feelsLike = ref('-')
    const pressure = ref('-')
    const precipitation = ref('0')
    const visibility = ref('10')
    const uvIndex = ref('-')
    const updateTime = ref('-')
    
    // 小时预报数据
    const hourlyForecast = ref([])
    
    // 表格列配置
    const hourlyColumns = [
      { prop: 'time', label: '时间', width: '80px' },
      { prop: 'condition', label: '天气状况' },
      { prop: 'temp', label: '温度(°C)', width: '90px' },
      { prop: 'realFeel', label: '体感温度(°C)', width: '110px' },
      { prop: 'humidity', label: '湿度(%)', width: '90px' },
      { prop: 'wind', label: '风向风力' },
      { prop: 'pop', label: '降水概率(%)', width: '110px' },
      { prop: 'pressure', label: '气压(hPa)', width: '100px' }
    ]
    
    // 获取天气图标路径
  const getWeatherIconPath = (condition) => {
    // 天气状况到图标文件的映射
    const weatherIconMap = {
      '晴': 'W0.png',
      '多云': 'W1.png',
      '阴': 'W2.png',
      '小雨': 'W7.png',
      '中雨': 'W8.png',
      '大雨': 'W9.png',
      '暴雨': 'W10.png',
      '小雪': 'W13.png',
      '中雪': 'W14.png',
      '大雪': 'W15.png',
      '暴雪': 'W16.png',
      '雾': 'W18.png',
      '冰雹': 'W19.png',
      '雨夹雪': 'W6.png',
      '阵雨': 'W3.png',
      '雷阵雨': 'W4.png',
      '雷电': 'W5.png'
    }

    // 获取对应的图标文件名，默认为晴天
    const iconFile = weatherIconMap[condition] || 'W0.png'
    
    // 返回完整路径
    return require(`@/assets/images/weather/${iconFile}`)
  }
    
    // 获取紫外线等级描述
    const getUVIndexDesc = (index) => {
      if (index <= 2) return '低'
      if (index <= 5) return '中等'
      if (index <= 7) return '高'
      if (index <= 10) return '很高'
      return '极高'
    }
    
    // 格式化日期时间
    const formatDateTime = (date, hour) => {
      return `${date} ${hour.padStart(2, '0')}:00`
    }
    
    // 获取时间范围文本
    const getTimeRangeText = () => {
      if (hourlyForecast.value.length < 2) return ''
      const firstHour = hourlyForecast.value[0]
      const lastHour = hourlyForecast.value[hourlyForecast.value.length - 1]
      return `${firstHour.date} ${firstHour.hour}:00 至 ${lastHour.date} ${lastHour.hour}:00`
    }
    
    // 处理小时预报数据
    const processHourlyData = (hourlyData) => {
      const currentHour = new Date().getHours()
      
      return hourlyData.map((item) => {
        // 时间显示
        let timeDisplay
        const hourNum = parseInt(item.hour)
        const isToday = item.date === new Date().toISOString().split('T')[0]
        
        if (isToday && hourNum === currentHour) {
          timeDisplay = '现在'
        } else if (hourNum === 0) {
          timeDisplay = '凌晨'
        } else if (hourNum === 12) {
          timeDisplay = '中午'
        } else if (hourNum < 6) {
          timeDisplay = `凌晨${hourNum}点`
        } else if (hourNum < 12) {
          timeDisplay = `上午${hourNum}点`
        } else if (hourNum < 18) {
          timeDisplay = `下午${hourNum-12}点`
        } else {
          timeDisplay = `晚上${hourNum-12}点`
        }
        
        return {
          date: item.date,
          hour: item.hour,
          time: timeDisplay,
          temp: item.temp,
          condition: item.condition,
          humidity: item.humidity,
          wind: `${item.windDir} ${item.windlevel}级`,
          windDir: item.windDir,
          windLevel: item.windlevel,
          realFeel: item.realFeel,
          pressure: item.pressure,
          pop: item.pop || '0',
          isNow: isToday && hourNum === currentHour
        }
      })
    }
    
    // 图表配置
    const chartOptions = computed(() => {
      if (hourlyForecast.value.length === 0) return {}
      
      const hours = hourlyForecast.value.map(item => item.time)
      const temps = hourlyForecast.value.map(item => parseInt(item.temp))
      const feels = hourlyForecast.value.map(item => parseInt(item.realFeel))
      
      // 计算温度范围以设置Y轴
      const allTemps = [...temps, ...feels]
      const minTemp = Math.min(...allTemps) - 2
      const maxTemp = Math.max(...allTemps) + 2
      
      return {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const time = params[0].name
            const temp = params[0].value
            const feel = params[1].value
            
            return `
              <div style="font-weight:bold;margin-bottom:5px">${time}</div>
              <div style="display:flex;align-items:center">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#EA4335;margin-right:5px"></span>
                <span>温度: ${temp}°C</span>
              </div>
              <div style="display:flex;align-items:center">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#4285F4;margin-right:5px"></span>
                <span>体感温度: ${feel}°C</span>
              </div>
            `
          }
        },
        legend: {
          data: ['温度', '体感温度'],
          right: '5%'
        },
        grid: {
          left: '3%',
          right: '5%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: hours,
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          },
          axisLabel: {
            color: '#666',
            interval: 2,
            rotate: 0
          }
        },
        yAxis: {
          type: 'value',
          name: '温度 (°C)',
          min: minTemp,
          max: maxTemp,
          nameTextStyle: {
            color: '#666'
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            color: '#666'
          },
          splitLine: {
            lineStyle: {
              color: '#eee'
            }
          }
        },
        series: [
          {
            name: '温度',
            type: 'line',
            data: temps,
            symbolSize: 8,
            itemStyle: {
              color: '#EA4335'
            },
            lineStyle: {
              width: 3
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(234, 67, 53, 0.3)' },
                  { offset: 1, color: 'rgba(234, 67, 53, 0.05)' }
                ]
              }
            },
            markPoint: {
              data: [
                { type: 'max', name: '最高温' },
                { type: 'min', name: '最低温' }
              ]
            }
          },
          {
            name: '体感温度',
            type: 'line',
            data: feels,
            symbolSize: 8,
            itemStyle: {
              color: '#4285F4'
            },
            lineStyle: {
              width: 3
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(66, 133, 244, 0.3)' },
                  { offset: 1, color: 'rgba(66, 133, 244, 0.05)' }
                ]
              }
            }
          }
        ]
      }
    })
    
    // 搜索城市天气
    const searchWeather = async () => {
      if (!searchQuery.value) {
        ElMessage.warning('请输入城市名称')
        return
      }
      
      loading.value = true
      
      try {
        // 使用封装好的API服务获取天气数据
        const response = await getWeather(searchQuery.value)
        
        if (response.data && response.data.code === 0) {
          const weatherData = response.data.data
          const cityData = weatherData.city
          const hourlyData = weatherData.hourly
          
          // 更新城市信息
          cityName.value = cityData.name
          
          if (hourlyData && hourlyData.length > 0) {
            // 处理当前天气
            const current = hourlyData[0]
            currentTemp.value = current.temp
            currentCondition.value = current.condition
            windDirection.value = current.windDir
            windPower.value = `${current.windlevel}级`
            humidity.value = current.humidity
            feelsLike.value = current.realFeel
            pressure.value = current.pressure
            uvIndex.value = current.uvi || 0
            precipitation.value = current.pop || '0'
            
            // 更新时间
            updateTime.value = current.updatetime || formatDateTime(current.date, current.hour)
            
            // 处理小时预报
            hourlyForecast.value = processHourlyData(hourlyData)
          }
          
          ElMessage.success(`成功获取${cityName.value}的天气数据`)
        } else {
          throw new Error('获取天气数据失败')
        }
      } catch (error) {
        ElMessage.error('获取天气数据失败')
        console.error(error)
      } finally {
        loading.value = false
      }
    }
    // 初始化用户城市
    const initUserCity = async () => {
      try {
        const response = await getUserInfo()

        if (response && response.data.code === 1 && response.data) {
          searchQuery.value = response.data.data.currentCity
          cityName.value = response.data.data.currentCity
        } else {
          // 如果没有获取到用户城市，使用默认城市
          searchQuery.value = '沈阳市'
          cityName.value = '沈阳市'
        }
        // 获取天气数据
        searchWeather()
      } catch (error) {
        console.error('获取用户信息失败', error)
        // 出错时使用默认城市
        searchQuery.value = '沈阳市'
        cityName.value = '沈阳市'
        searchWeather()
      }
    }
    
    onMounted(() => {
      initUserCity()
    })
    
    return {
      loading,
      searchQuery,
      cityName,
      currentTemp,
      currentCondition,
      windDirection,
      windPower,
      humidity,
      feelsLike,
      pressure,
      precipitation,
      visibility,
      uvIndex,
      updateTime,
      hourlyForecast,
      hourlyColumns,
      chartOptions,
      searchWeather,
      getWeatherIconPath, 
      getUVIndexDesc,
      getTimeRangeText
    }
  }
}
</script>

<style lang="scss" scoped>
.weather-search {
  margin-bottom: 20px;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.city-search {
  flex: 1;
}

.weather-card {
  margin-bottom: 20px;
}

.time-range {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  text-align: center;
}

.current-weather {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  position: relative;
}

.weather-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
  
  .weather-icon {
    font-size: 80px;
    color: #4285F4;
    margin-bottom: 10px;
    background: rgba(66, 133, 244, 0.1);
    border-radius: 50%;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 20px rgba(66, 133, 244, 0.1);
  }
  
  .city-name {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    background: linear-gradient(45deg, #4285F4, #34A853);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.weather-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  .temp-large {
    font-size: 56px;
    font-weight: 700;
    color: #333;
    line-height: 1;
    margin-bottom: 10px;
  }
  
  .condition {
    font-size: 24px;
    color: #666;
    margin-bottom: 15px;
  }
  
  .weather-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    
    .meta-item {
      display: flex;
      align-items: center;
      color: #666;
      
      i {
        margin-right: 5px;
        color: #4285F4;
      }
    }
  }
}

.update-time {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 12px;
  color: #999;
}

.weather-quality {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  background: #f9f9f9;
  border-radius: 12px;
  margin-top: 20px;
  padding: 15px;
  
  .quality-item {
    text-align: center;
    padding: 15px 10px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    
    .quality-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .quality-value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }
}

.hourly-forecast {
  margin-top: 15px;
  
  .forecast-scrollable {
    display: flex;
    overflow-x: auto;
    padding: 10px 0;
    gap: 15px;
    
    &::-webkit-scrollbar {
      height: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(66, 133, 244, 0.3);
      border-radius: 3px;
    }
  }
  
  .hourly-item {
    min-width: 100px;
    text-align: center;
    padding: 15px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(66, 133, 244, 0.1);
    }
    
    &.active-hour {
      background: linear-gradient(45deg, rgba(66, 133, 244, 0.1), rgba(52, 168, 83, 0.1));
      border: 2px solid rgba(66, 133, 244, 0.3);
      transform: translateY(-5px);
    }
    
    .hourly-time {
      font-size: 14px;
      font-weight: 500;
      color: #666;
      margin-bottom: 10px;
    }
    
    .hourly-icon {
      font-size: 32px;
      color: #4285F4;
      margin-bottom: 10px;
    }
    
    .hourly-temp {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }
    
    .hourly-condition {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    
    .hourly-wind {
      font-size: 11px;
      color: #999;
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .current-weather {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .weather-left {
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .weather-details {
    align-items: center;
  }
  
  .weather-quality {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>