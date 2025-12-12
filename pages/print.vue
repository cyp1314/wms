<template>
  <view class="container">
    <view class="form">
      <view class="form-item">
        <text>客户名称：</text>
        <input v-model="formData.customerName" @input="debouncedDraw" placeholder="请输入客户名称" />
      </view>
      <view class="form-item">
        <text>订单号：</text>
        <input v-model="formData.orderNumber" @input="debouncedDraw" placeholder="请输入订单号" />
      </view>
      <view class="form-item">
        <text>商品名称：</text>
        <input v-model="formData.productName" @input="debouncedDraw" placeholder="请输入商品名称" />
      </view>
      <view class="form-item">
        <text>数量：</text>
        <input v-model.number="formData.quantity" @input="debouncedDraw" placeholder="请输入数量" type="number" />
      </view>
      <view class="form-item">
        <text>条形码：</text>
        <input v-model="formData.barcode" @input="debouncedDraw" placeholder="请输入条形码" />
      </view>
      <view class="form-item">
        <text>二维码内容：</text>
        <input v-model="formData.qrContent" @input="debouncedDraw" placeholder="请输入二维码内容" />
      </view>
      <button @click="generateBase64">生成Base64</button>
    </view>
    <canvas canvas-id="printCanvas" class="canvas"></canvas>
    <view class="result" v-if="base64Result">
      <text>Base64结果：</text>
      <image :src="base64Result" class="result-image" />
    </view>
  </view>
</template>

<script>
  import * as JsBarcode from '@/utils/JsBarcode.all.min.js';
  import QRCode from '@/utils/qrcode.min.js';

  export default {
    data() {
      return {
        formData: {
          customerName: '客户名称',
          orderNumber: 'ORD-20230520-001',
          productName: '产品名称',
          quantity: 100,
          barcode: '123456789012',
          qrContent: 'https://www.example.com/product/123456'
        },
        base64Result: '',
        ctx: null,
        debounceTimer: null
      };
    },

    onReady() {
      this.initCanvas();
      this.$nextTick(() => {
        this.drawCanvas();
      });
    },

    methods: {
      initCanvas() {
        // 获取Canvas上下文
        this.ctx = uni.createCanvasContext('printCanvas', this);

        // 设置Canvas尺寸
        const query = uni.createSelectorQuery().in(this);
        query.select('.canvas')
          .fields({ node: true, size: true })
          .exec((res) => {
            const canvas = res[0].node;
            this.ctx.width = canvas.width = 600;
            this.ctx.height = canvas.height = 400;
            this.drawCanvas();
          });
      },

      debouncedDraw() {
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
          this.drawCanvas();
        }, 300);
      },

      drawCanvas() {
        // 清除画布
        this.ctx.clearRect(0, 0, 600, 400);

        // 设置边框
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(10, 10, 580, 380);

        // 绘制标题
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('物流面单', 300, 50);

        // 绘制客户信息
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('客户名称：' + this.formData.customerName, 40, 100);
        this.ctx.fillText('订单号：' + this.formData.orderNumber, 40, 140);
        this.ctx.fillText('商品名称：' + this.formData.productName, 40, 180);
        this.ctx.fillText('数量：' + this.formData.quantity, 40, 220);

        // 绘制条形码
        this.drawBarcode(this.formData.barcode, 40, 250, 300, 80);

        // 绘制二维码
        this.drawQRCode(this.formData.qrContent, 400, 100, 150, 150);

        // 绘制表格
        this.drawTable();

        // 执行绘制
        this.ctx.draw();
      },

      // 绘制条形码
      drawBarcode(text, x, y, width, height) {
        try {
          // 创建一个临时的canvas元素来生成条形码
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;

          // 使用JsBarcode生成条形码
          JsBarcode(tempCanvas, text, {
            format: "CODE128",
            width: 4,
            height: height,
            displayValue: false,
            margin: 0
          });

          // 将临时canvas绘制到主canvas上
          this.ctx.drawImage(tempCanvas, x, y);
        } catch (e) {
          console.error("Barcode generation failed", e);
        }
      },

      // 绘制二维码
      drawQRCode(content, x, y, width, height) {
        try {
          // 创建一个临时的canvas元素来生成二维码
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;

          // 使用QRCode生成二维码
          new QRCode(tempCanvas, {
            text: content,
            width: width,
            height: height,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.L
          });

          // 将临时canvas绘制到主canvas上
          this.ctx.drawImage(tempCanvas, x, y);
        } catch (e) {
          console.error("QRCode generation failed", e);
        }
      },

      // 绘制表格
      drawTable() {
        // 表格起点
        const startX = 40;
        const startY = 350;
        const tableWidth = 520;
        const rowHeight = 30;

        // 绘制表头
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(startX, startY, tableWidth, rowHeight);
        this.ctx.strokeRect(startX, startY, tableWidth, rowHeight);

        this.ctx.fillStyle = '#000000';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('订单信息', startX + 10, startY + 20);

        // 绘制表内容
        this.ctx.font = '14px Arial';
        this.ctx.fillText('物流单号：WMS-20230520-001', startX + 10, startY + 50);
        this.ctx.fillText('发货日期：2023-05-20', startX + 250, startY + 50);
      },

      // 生成Base64
      generateBase64() {
        uni.canvasToTempFilePath({
          canvasId: 'printCanvas',
          success: (res) => {
            this.base64Result = res.tempFilePath;
            console.log('Base64 generated:', this.base64Result);
          },
          fail: (err) => {
            console.error('Failed to generate Base64:', err);
          }
        }, this);
      }
    }
  };
</script>

<style scoped>
  .container {
    padding: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .form {
    width: 100%;
    margin-bottom: 20rpx;
    padding: 20rpx;
    background-color: #f5f5f5;
    border-radius: 10rpx;
  }

  .form-item {
    margin-bottom: 15rpx;
    display: flex;
    align-items: center;
  }

  .form-item text {
    width: 200rpx;
    font-size: 16px;
  }

  .form-item input {
    flex: 1;
    padding: 10rpx;
    border: 1px solid #ddd;
    border-radius: 5rpx;
    font-size: 16px;
  }

  button {
    margin-top: 20rpx;
    padding: 15rpx;
    background-color: #007aff;
    color: white;
    border: none;
    border-radius: 5rpx;
    font-size: 18px;
  }

  .canvas {
    width: 100%;
    height: 600rpx;
    background-color: white;
    margin-bottom: 20rpx;
  }

  .result {
    width: 100%;
    margin-top: 20rpx;
    padding: 20rpx;
    background-color: #f5f5f5;
    border-radius: 10rpx;
  }

  .result-image {
    width: 100%;
    height: auto;
    margin-top: 10rpx;
  }
</style>