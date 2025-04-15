<template>
    <div class="modern-input-container">
      <div 
        class="modern-input-wrapper"
        :class="[
          size,
          { 
            'is-focused': focused,
            'is-disabled': disabled,
            'has-error': error,
            'has-prefix': prefix || $slots.prefix,
            'has-suffix': suffix || $slots.suffix || showClearButton,
            'is-readonly': readonly,
            'is-transparent': transparent
          }
        ]"
      >
        <div v-if="prefix || $slots.prefix" class="input-prefix">
          <slot name="prefix">
            <i v-if="prefix" :class="prefix"></i>
          </slot>
        </div>
        
        <input
          :type="type"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :name="name"
          :autocomplete="autocomplete"
          :autofocus="autofocus"
          :maxlength="maxlength"
          class="modern-input"
          ref="inputElement"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        
        <div v-if="showClearButton" class="input-clear-btn" @click="clearInput">
          <i class="el-icon-close"></i>
        </div>
        
        <div v-if="suffix || $slots.suffix" class="input-suffix">
          <slot name="suffix">
            <i v-if="suffix" :class="suffix"></i>
          </slot>
        </div>
      </div>
      
      <div v-if="error" class="input-error-message">{{ error }}</div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue'
  
  export default {
    name: 'ModernInput',
    props: {
      modelValue: {
        type: [String, Number],
        default: ''
      },
      type: {
        type: String,
        default: 'text'
      },
      placeholder: {
        type: String,
        default: ''
      },
      disabled: {
        type: Boolean,
        default: false
      },
      readonly: {
        type: Boolean,
        default: false
      },
      name: {
        type: String,
        default: ''
      },
      autocomplete: {
        type: String,
        default: 'off'
      },
      autofocus: {
        type: Boolean,
        default: false
      },
      maxlength: {
        type: Number,
        default: undefined
      },
      clearable: {
        type: Boolean,
        default: false
      },
      prefix: {
        type: String,
        default: ''
      },
      suffix: {
        type: String,
        default: ''
      },
      size: {
        type: String,
        default: 'medium',
        validator: value => ['small', 'medium', 'large'].includes(value)
      },
      error: {
        type: String,
        default: ''
      },
      transparent: {
        type: Boolean,
        default: false
      }
    },
    emits: ['update:modelValue', 'focus', 'blur', 'clear', 'enter'],
    setup(props, { emit }) {
      const focused = ref(false)
      const inputElement = ref(null)
      
      // 判断是否显示清除按钮
      const showClearButton = computed(() => {
        return props.clearable && props.modelValue && !props.disabled && !props.readonly
      })
      
      // 处理输入
      const handleInput = (e) => {
        emit('update:modelValue', e.target.value)
      }
      
      // 处理焦点
      const handleFocus = (e) => {
        focused.value = true
        emit('focus', e)
      }
      
      // 处理失焦
      const handleBlur = (e) => {
        focused.value = false
        emit('blur', e)
      }
      
      // 清空输入
      const clearInput = () => {
        emit('update:modelValue', '')
        emit('clear')
        // 聚焦回输入框
        inputElement.value?.focus()
      }
      
      // 聚焦方法供外部调用
      const focus = () => {
        inputElement.value?.focus()
      }
      
      // 失焦方法供外部调用
      const blur = () => {
        inputElement.value?.blur()
      }
      
      return {
        focused,
        inputElement,
        showClearButton,
        handleInput,
        handleFocus,
        handleBlur,
        clearInput,
        focus,
        blur
      }
    }
  }
  </script>
  
  <style scoped>
  .modern-input-wrapper {
    display: flex;
    align-items: center;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .modern-input-wrapper.small {
    height: 32px;
  }
  
  .modern-input-wrapper.medium {
    height: 40px;
  }
  
  .modern-input-wrapper.large {
    height: 48px;
  }
  
  .modern-input-wrapper.is-focused {
    border-color: #4285F4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }
  
  .modern-input-wrapper.has-error {
    border-color: #EA4335;
  }
  
  .modern-input-wrapper.is-disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  
  .modern-input-wrapper.is-readonly {
    background-color: #fafafa;
  }
  
  .modern-input-wrapper.is-transparent {
    background-color: transparent;
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .input-prefix, .input-suffix {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    color: #9e9e9e;
  }
  
  .modern-input {
    flex: 1;
    height: 100%;
    border: none;
    outline: none;
    background: transparent;
    padding: 0 12px;
    color: #333;
    font-size: 14px;
  }
  
  .modern-input-wrapper.has-prefix .modern-input {
    padding-left: 4px;
  }
  
  .modern-input-wrapper.has-suffix .modern-input {
    padding-right: 4px;
  }
  
  .modern-input::placeholder {
    color: #9e9e9e;
  }
  
  .modern-input-wrapper.is-disabled .modern-input {
    cursor: not-allowed;
    color: #9e9e9e;
  }
  
  .input-clear-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: #9e9e9e;
    cursor: pointer;
    margin-right: 12px;
  }
  
  .input-clear-btn:hover {
    color: #666;
  }
  
  .input-error-message {
    color: #EA4335;
    font-size: 12px;
    margin-top: 4px;
    padding-left: 4px;
  }
  
  .modern-input-wrapper.small .modern-input {
    font-size: 12px;
  }
  
  .modern-input-wrapper.large .modern-input {
    font-size: 16px;
  }
  </style>