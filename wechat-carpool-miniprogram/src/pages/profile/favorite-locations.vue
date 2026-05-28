<template>
  <view class="favoriteLocationsPage">
    <view class="header">
      <button class="addBtn" @click="addLocation">
        <text class="icon">+</text>
        <text>添加常用地点</text>
      </button>
    </view>

    <view v-if="locations.length === 0" class="empty">
      <text class="emptyText">暂无常用地点</text>
      <text class="emptyHint">点击上方按钮添加</text>
    </view>

    <view v-else class="locationList">
      <view
        v-for="(location, index) in locations"
        :key="index"
        class="locationItem"
      >
        <view class="locationIcon">{{ getLocationIcon(location.name) }}</view>
        <view class="locationInfo">
          <text class="locationName">{{ location.name }}</text>
          <text class="locationAddress">{{ location.address }}</text>
          <text class="locationCount">使用 {{ location.useCount }} 次</text>
        </view>
        <view class="locationActions">
          <button class="actionBtn" @click="editLocation(location)">编辑</button>
          <button class="actionBtn delete" @click="deleteLocation(location)">删除</button>
        </view>
      </view>
    </view>

    <view v-if="showEditModal" class="modalOverlay" @click.self="closeModal">
      <view class="modal">
        <view class="modalTitle">{{ editingLocation ? '编辑地点' : '添加地点' }}</view>
        <view class="formItem">
          <text class="label">名称</text>
          <input
            class="input"
            v-model="editForm.name"
            placeholder="如:家、公司、学校"
            maxlength="50"
          />
        </view>
        <view class="formItem">
          <text class="label">地址</text>
          <input
            class="input"
            v-model="editForm.address"
            placeholder="详细地址"
            maxlength="200"
          />
        </view>
        <view class="modalActions">
          <button class="cancelBtn" @click="closeModal">取消</button>
          <button class="confirmBtn" @click="saveLocation">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getFavoriteLocations,
  createFavoriteLocation,
  updateFavoriteLocation,
  deleteFavoriteLocation,
  type FavoriteLocation,
} from '../../api/favorite-location'

const locations = ref<FavoriteLocation[]>([])
const showEditModal = ref(false)
const editingLocation = ref<FavoriteLocation | null>(null)
const editForm = ref({ name: '', address: '' })

onMounted(() => {
  loadLocations()
})

const loadLocations = async () => {
  try {
    locations.value = await getFavoriteLocations()
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const addLocation = () => {
  editingLocation.value = null
  editForm.value = { name: '', address: '' }
  showEditModal.value = true
}

const editLocation = (location: FavoriteLocation) => {
  editingLocation.value = location
  editForm.value = { name: location.name, address: location.address }
  showEditModal.value = true
}

const closeModal = () => {
  showEditModal.value = false
}

const saveLocation = async () => {
  if (!editForm.value.name.trim() || !editForm.value.address.trim()) {
    uni.showToast({ title: '名称和地址不能为空', icon: 'none' })
    return
  }
  try {
    if (editingLocation.value) {
      await updateFavoriteLocation(editingLocation.value.id, editForm.value)
    } else {
      await createFavoriteLocation(editForm.value)
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
    closeModal()
    loadLocations()
  } catch {
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

const deleteLocation = (location: FavoriteLocation) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${location.name}"吗?`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteFavoriteLocation(location.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          loadLocations()
        } catch {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

const getLocationIcon = (name: string) => {
  if (name.includes('家')) return '🏠'
  if (name.includes('公司')) return '🏢'
  if (name.includes('学校')) return '🏫'
  if (name.includes('健身')) return '🏋️'
  if (name.includes('医院')) return '🏥'
  return '📍'
}
</script>

<style scoped>
.favoriteLocationsPage {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  padding: 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.addBtn {
  width: 100%;
  height: 80rpx;
  background: #1890ff;
  color: #fff;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  border: none;
}

.addBtn .icon {
  margin-right: 10rpx;
  font-size: 32rpx;
}

.empty {
  padding: 200rpx 0;
  text-align: center;
}

.emptyText {
  display: block;
  font-size: 28rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.emptyHint {
  display: block;
  font-size: 24rpx;
  color: #ccc;
}

.locationList {
  padding: 0 30rpx;
}

.locationItem {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

.locationIcon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.locationInfo {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.locationName {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.locationAddress {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.locationCount {
  font-size: 22rpx;
  color: #999;
}

.locationActions {
  display: flex;
  gap: 16rpx;
}

.actionBtn {
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  border-radius: 8rpx;
  border: 1rpx solid #d9d9d9;
  background: #fff;
  color: #333;
}

.actionBtn.delete {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  width: 600rpx;
}

.modalTitle {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 30rpx;
  text-align: center;
}

.formItem {
  margin-bottom: 24rpx;
}

.label {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.input {
  width: 100%;
  height: 72rpx;
  border: 1rpx solid #d9d9d9;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.modalActions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.cancelBtn {
  flex: 1;
  height: 80rpx;
  border: 1rpx solid #d9d9d9;
  border-radius: 12rpx;
  background: #fff;
  color: #666;
  font-size: 28rpx;
}

.confirmBtn {
  flex: 1;
  height: 80rpx;
  background: #1890ff;
  border-radius: 12rpx;
  color: #fff;
  font-size: 28rpx;
  border: none;
}
</style>
