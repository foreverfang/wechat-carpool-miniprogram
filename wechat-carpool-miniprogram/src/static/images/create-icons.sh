#!/bin/bash
# 创建简单的占位图标（81x81 灰色方块）
for icon in home publish chat profile; do
  # 普通状态 - 灰色
  convert -size 81x81 xc:#999999 "${icon}.png"
  # 选中状态 - 蓝色
  convert -size 81x81 xc:#1890FF "${icon}-active.png"
done
