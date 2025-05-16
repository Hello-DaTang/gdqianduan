/**
 * 提取天气数据中的核心信息，只保留未来12小时的数据
 * @param {Object} weatherData - 原始完整天气数据
 * @returns {Object} - 只包含12小时数据的天气数据
 */
export function simplifyWeatherData(weatherData) {
  // 处理空数据或缺少必要字段的情况
  if (!weatherData) return null;
  
  // 提取城市基本信息，如果存在的话
  const cityInfo = weatherData.city ? {
    name: weatherData.city.name || "",
    pname: weatherData.city.pname || "",
    cityId: weatherData.city.cityId || ""
  } : { name: "", pname: "", cityId: "" };
  
  // 确保hourly数据是一个数组
  const hourlyData = Array.isArray(weatherData.hourly) ? weatherData.hourly : [];
  
  // 只提取未来12小时的数据，而非全部24小时
  // 保留所有字段，不做进一步精简
  const next12Hours = hourlyData.slice(0, 12);
  
  // 提取当前天气（第一个小时的数据）
  const currentHour = next12Hours.length > 0 ? next12Hours[0] : null;
  
  return {
    city: cityInfo,
    current: currentHour,
    hourly: next12Hours
  };
}