<template>
    <div class="modern-table-container">
      <div v-if="title || $slots.header" class="table-header">
        <h3 v-if="title" class="table-title">{{ title }}</h3>
        <slot name="header"></slot>
        <div v-if="$slots.headerActions" class="header-actions">
          <slot name="headerActions"></slot>
        </div>
      </div>
      
      <div class="table-content">
        <div v-if="loading" class="table-loading">
          <loading-indicator :size="loadingSize" :text="loadingText" />
        </div>
        
        <div v-else-if="error" class="table-error">
          <empty-state 
            icon="el-icon-warning-outline"
            title="数据加载错误"
            :description="error"
          >
            <template #action>
              <modern-button
                type="primary"
                size="small"
                @click="$emit('retry')"
                text="重试"
                icon="el-icon-refresh"
              />
            </template>
          </empty-state>
        </div>
        
        <template v-else>
          <div class="table-toolbar" v-if="showToolbar">
            <div class="toolbar-filters">
              <slot name="filters"></slot>
            </div>
            <div class="toolbar-actions">
              <slot name="actions"></slot>
            </div>
          </div>
          
          <div class="table-wrapper">
            <table class="modern-table" :class="{ 'bordered': bordered, 'striped': striped, 'hover': hover }">
              <thead>
                <tr>
                  <th v-if="selectable" class="selection-column">
                    <el-checkbox 
                      :modelValue="isAllSelected"
                      :indeterminate="isIndeterminate"
                      @update:modelValue="toggleAllSelection"
                    />
                  </th>
                  <th v-for="column in visibleColumns" :key="column.prop" :class="{ 'sortable': column.sortable }">
                    <div class="column-content">
                      <span>{{ column.label }}</span>
                      <i 
                        v-if="column.sortable"
                        :class="[
                          'el-icon-sort',
                          { 
                            'sort-asc': sortField === column.prop && sortOrder === 'asc',
                            'sort-desc': sortField === column.prop && sortOrder === 'desc'
                          }
                        ]"
                        @click="handleSort(column.prop)"
                      ></i>
                    </div>
                  </th>
                  <th v-if="$slots.actions" class="actions-column">操作</th>
                </tr>
              </thead>
              
              <tbody>
                <template v-if="data && data.length">
                  <tr 
                    v-for="(row, index) in sortedData" 
                    :key="getRowKey(row, index)"
                    :class="{ 'selected': isSelected(row) }"
                    @click="handleRowClick(row, index)"
                  >
                    <td v-if="selectable" class="selection-column">
                      <el-checkbox 
                        :modelValue="isSelected(row)"
                        @update:modelValue="val => toggleSelection(row, val)"
                        @click.stop
                      />
                    </td>
                    <td v-for="column in visibleColumns" :key="column.prop">
                      <template v-if="column.slot">
                        <slot :name="column.slot" :row="row" :index="index" :column="column"></slot>
                      </template>
                      <template v-else>
                        {{ getColumnValue(row, column) }}
                      </template>
                    </td>
                    <td v-if="$slots.actions" class="actions-column">
                      <slot name="actions" :row="row" :index="index"></slot>
                    </td>
                  </tr>
                </template>
                <tr v-else>
                  <td :colspan="getColSpan" class="empty-cell">
                    <empty-state 
                      icon="el-icon-document"
                      :title="emptyText"
                      description="暂无数据"
                    >
                      <template v-if="$slots.empty" #action>
                        <slot name="empty"></slot>
                      </template>
                    </empty-state>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-if="pagination && data.length > 0" class="table-pagination">
            <el-pagination
              :current-page="currentPage"
              :page-size="pageSize"
              :total="totalItems"
              :page-sizes="pageSizes"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </template>
      </div>
      
      <div v-if="$slots.footer" class="table-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, watch } from 'vue'
  import LoadingIndicator from '@/components/feedback/LoadingIndicator.vue'
  import EmptyState from '@/components/feedback/EmptyState.vue'
  import ModernButton from '@/components/ui/ModernButton.vue'
  
  export default {
    name: 'ModernTable',
    components: {
      LoadingIndicator,
      EmptyState,
      ModernButton
    },
    props: {
      columns: {
        type: Array,
        default: () => []
      },
      data: {
        type: Array,
        default: () => []
      },
      rowKey: {
        type: [String, Function],
        default: 'id'
      },
      title: {
        type: String,
        default: ''
      },
      bordered: {
        type: Boolean,
        default: false
      },
      striped: {
        type: Boolean,
        default: true
      },
      hover: {
        type: Boolean,
        default: true
      },
      loading: {
        type: Boolean,
        default: false
      },
      loadingText: {
        type: String,
        default: '加载中...'
      },
      loadingSize: {
        type: String,
        default: 'medium'
      },
      error: {
        type: String,
        default: ''
      },
      emptyText: {
        type: String,
        default: '暂无数据'
      },
      pagination: {
        type: Boolean,
        default: false
      },
      currentPage: {
        type: Number,
        default: 1
      },
      pageSize: {
        type: Number,
        default: 10
      },
      pageSizes: {
        type: Array,
        default: () => [10, 20, 50, 100]
      },
      totalItems: {
        type: Number,
        default: 0
      },
      selectable: {
        type: Boolean,
        default: false
      },
      sortable: {
        type: Boolean,
        default: false
      },
      defaultSort: {
        type: Object,
        default: () => ({})
      }
    },
    emits: [
      'row-click',
      'select',
      'select-all',
      'page-change',
      'size-change',
      'sort-change',
      'retry'
    ],
    setup(props, { emit, slots }) {  // 添加slots参数
      // 选中的行
      const selectedRows = ref([])
      
      // 排序状态
      const sortField = ref(props.defaultSort.prop || '')
      const sortOrder = ref(props.defaultSort.order || '')
      
      // 计算可见列
      const visibleColumns = computed(() => {
        return props.columns.filter(column => !column.hidden)
      })
      
      // 是否显示工具栏
      const showToolbar = computed(() => {
        return !!slots.filters || !!slots.actions
      })
      
      // 计算表格列数
      const getColSpan = computed(() => {
        let span = visibleColumns.value.length
        if (props.selectable) span++
        if (slots.actions) span++
        return span
      })
      
      // 计算全选状态
      const isAllSelected = computed(() => {
        return props.data.length > 0 && selectedRows.value.length === props.data.length
      })
      
      // 计算半选状态
      const isIndeterminate = computed(() => {
        return selectedRows.value.length > 0 && selectedRows.value.length < props.data.length
      })
      
      // 计算排序后的数据
      const sortedData = computed(() => {
        if (!sortField.value || !sortOrder.value) {
          return props.data
        }
        
        return [...props.data].sort((a, b) => {
          const aValue = getColumnValue({ row: a, column: { prop: sortField.value } })
          const bValue = getColumnValue({ row: b, column: { prop: sortField.value } })
          
          if (sortOrder.value === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })
      })
      
      // 获取行唯一键
      const getRowKey = (row, index) => {
        if (typeof props.rowKey === 'function') {
          return props.rowKey(row)
        }
        return row[props.rowKey] || index
      }
      
      // 获取列值
      const getColumnValue = (row, column) => {
        if (column.formatter) {
          return column.formatter(row, column)
        }
        
        // 支持嵌套属性 (例如: 'user.name')
        const properties = column.prop.split('.')
        return properties.reduce((obj, key) => {
          return obj && obj[key] !== undefined ? obj[key] : undefined
        }, row)
      }
      
      // 处理行点击
      const handleRowClick = (row, index) => {
        emit('row-click', row, index)
      }
      
      // 处理排序
      const handleSort = (field) => {
        // 如果点击的是当前排序字段
        if (field === sortField.value) {
          // 切换排序顺序：无 -> 升序 -> 降序 -> 无
          if (sortOrder.value === '') {
            sortOrder.value = 'asc'
          } else if (sortOrder.value === 'asc') {
            sortOrder.value = 'desc'
          } else {
            sortField.value = ''
            sortOrder.value = ''
          }
        } else {
          // 如果点击新字段，设置为升序
          sortField.value = field
          sortOrder.value = 'asc'
        }
        
        emit('sort-change', { prop: sortField.value, order: sortOrder.value })
      }
      
      // 切换行选择
      const toggleSelection = (row, selected) => {
        const key = getRowKey(row, props.data.indexOf(row))
        
        if (selected) {
          // 添加到选中列表
          if (!isSelected(row)) {
            selectedRows.value.push(row)
          }
        } else {
          // 从选中列表移除
          const index = selectedRows.value.findIndex(item => 
            getRowKey(item, props.data.indexOf(item)) === key
          )
          if (index !== -1) {
            selectedRows.value.splice(index, 1)
          }
        }
        
        emit('select', selectedRows.value, row)
      }
      
      // 切换全选
      const toggleAllSelection = (selected) => {
        if (selected) {
          selectedRows.value = [...props.data]
        } else {
          selectedRows.value = []
        }
        
        emit('select-all', selectedRows.value)
      }
      
      // 检查行是否被选中
      const isSelected = (row) => {
        const key = getRowKey(row, props.data.indexOf(row))
        return selectedRows.value.some(item => 
          getRowKey(item, props.data.indexOf(item)) === key
        )
      }
      
      // 处理页码变化
      const handleCurrentChange = (page) => {
        emit('page-change', page)
      }
      
      // 处理每页条数变化
      const handleSizeChange = (size) => {
        emit('size-change', size)
      }
      
      // 监听数据变化，清空选中状态
      watch(() => props.data, () => {
        selectedRows.value = []
      }, { deep: true })
      
      return {
        visibleColumns,
        showToolbar,
        selectedRows,
        getColSpan,
        isAllSelected,
        isIndeterminate,
        sortedData,
        sortField,
        sortOrder,
        getRowKey,
        getColumnValue,
        handleRowClick,
        handleSort,
        toggleSelection,
        toggleAllSelection,
        isSelected,
        handleCurrentChange,
        handleSizeChange
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .modern-table-container {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .table-header {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .table-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  
  .header-actions {
    display: flex;
    gap: 8px;
  }
  
  .table-content {
    position: relative;
    min-height: 100px;
  }
  
  .table-loading,
  .table-error {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.7);
    z-index: 1;
  }
  
  .table-toolbar {
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .toolbar-filters,
  .toolbar-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .table-wrapper {
    overflow-x: auto;
  }
  
  .modern-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: auto;
    
    th, td {
      padding: 12px 16px;
      text-align: left;
    }
    
    th {
      background-color: #f9f9f9;
      font-weight: 600;
      color: #666;
      white-space: nowrap;
      position: sticky;
      top: 0;
      z-index: 1;
      
      &.sortable {
        cursor: pointer;
        
        &:hover {
          background-color: #f0f0f0;
        }
      }
    }
    
    .column-content {
      display: flex;
      align-items: center;
      
      i {
        margin-left: 6px;
        color: #ccc;
        
        &.sort-asc,
        &.sort-desc {
          color: #4285F4;
        }
        
        &.sort-asc {
          transform: rotate(0);
        }
        
        &.sort-desc {
          transform: rotate(180deg);
        }
      }
    }
    
    tbody tr {
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s;
      
      &.selected {
        background-color: rgba(66, 133, 244, 0.05);
      }
    }
    
    &.striped tbody tr:nth-child(even) {
      background-color: #fafafa;
      
      &.selected {
        background-color: rgba(66, 133, 244, 0.05);
      }
    }
    
    &.hover tbody tr:hover {
      background-color: rgba(66, 133, 244, 0.05);
    }
    
    &.bordered {
      border: 1px solid #f0f0f0;
      
      th, td {
        border: 1px solid #f0f0f0;
      }
    }
    
    .selection-column,
    .actions-column {
      width: 1%;
      white-space: nowrap;
    }
    
    .actions-column {
      text-align: center;
    }
    
    .empty-cell {
      text-align: center;
      padding: 32px;
    }
  }
  
  .table-pagination {
    padding: 16px;
    display: flex;
    justify-content: flex-end;
  }
  
  .table-footer {
    padding: 16px;
    border-top: 1px solid #f0f0f0;
  }
  </style>