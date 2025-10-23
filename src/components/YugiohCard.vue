<template>
  <div class="yugioh-card-container">
    <div class="yugioh-card">
      <div ref="card" class="card" />
    </div>
    <div class="form">
      <div class="form-header">
        <div class="form-title">
          <span>Yugioh Card</span>
          <Icon
            class="github-icon"
            icon="ri:github-fill"
            width="24"
            height="24"
            @click="toGithub"
          />
        </div>
        <div class="form-description">
          <span>A tool to use HTML Canvas to render YuGiOh cards</span>
        </div>
      </div>

      <div class="form-main">
        <el-form :model="form" label-width="auto">
          <el-form-item label="Card Type">
            <el-select
              v-model="form.card"
              placeholder="请选择卡片"
              @change="changeCard"
            >
              <el-option label="YuGiOh TCG" value="yugioh" />
              <el-option label="Speed Duel" value="rush-duel" />
              <el-option label="YuGiOh Back" value="yugioh-back" />
              <el-option label="Field Center" value="field-center" />
              <el-option label="OCG Anime Style" value="yugioh-series-2" />
            </el-select>
          </el-form-item>
          <el-form-item label="Data">
            <json-editor-vue
              v-model="jsonData"
              style="width: 100%"
              mode="text"
              v-bind="jsonOption"
            />
          </el-form-item>
        </el-form>

        <div class="button-group">
          <el-button type="primary" @click="exportImage"
            >Export as PNG</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import {
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef,
  watch,
} from 'vue';
import {
  FieldCenterCard,
  RushDuelCard,
  YugiohBackCard,
  YugiohCard,
  YugiohSeries2Card,
} from 'yugioh-card';
import JsonEditorVue from 'json-editor-vue';
import fieldCenterDemo from '@/assets/demo/field-center-demo';
import rushDuelDemo from '@/assets/demo/rush-duel-demo';
import yugiohBackDemo from '@/assets/demo/yugioh-back-demo';
import yugiohDemo from '@/assets/demo/yugioh-demo';
import yugiohSeries2Demo from '@/assets/demo/yugioh-series-2-demo';

const card = ref(null);
const cardLeaf = shallowRef(null);
const form = reactive({
  card: 'yugioh',
  data: {},
});
const jsonData = ref('');
const jsonOption = reactive({
  mainMenuBar: false,
  statusBar: false,
});

onMounted(() => {
  changeCard();
});

onBeforeUnmount(() => {
  cardLeaf.value?.leafer.destroy();
});

function changeCard() {
  cardLeaf.value?.leafer.destroy();
  let Card;
  switch (form.card) {
    case 'yugioh':
      form.data = yugiohDemo;
      Card = YugiohCard;
      break;
    case 'rush-duel':
      form.data = rushDuelDemo;
      Card = RushDuelCard;
      break;
    case 'yugioh-back':
      form.data = yugiohBackDemo;
      Card = YugiohBackCard;
      break;
    case 'field-center':
      form.data = fieldCenterDemo;
      Card = FieldCenterCard;
      break;
    case 'yugioh-series-2':
      form.data = yugiohSeries2Demo;
      Card = YugiohSeries2Card;
      break;
    default:
      form.data = yugiohDemo;
      Card = YugiohCard;
  }
  cardLeaf.value = new Card({
    view: card.value,
    data: form.data,
    resourcePath:
      process.env.NODE_ENV === 'production'
        ? 'https://raw.githubusercontent.com/kooriookami/yugioh-card/refs/heads/master/src/assets/yugioh-card'
        : 'src/assets/yugioh-card',
  });
  jsonData.value = form.data;
}

function exportImage() {
  cardLeaf.value.leafer.export('card.png', {
    screenshot: true,
    pixelRatio: devicePixelRatio,
  });
}

watch(
  () => jsonData.value,
  () => {
    try {
      form.data = JSON.parse(jsonData.value);
      cardLeaf.value.setData(form.data);
    } catch (e) {}
  }
);

function toGithub() {
  open('https://github.com/kooriookami/yugioh-card');
}
</script>

<style lang="scss" scoped>
.yugioh-card-container {
  height: 100vh;
  display: flex;
  overflow: hidden;

  .yugioh-card {
    height: 100%;
    overflow: auto;
    flex-grow: 1;
    position: relative;
    padding: 20px;

    .card {
      display: inline-block;
      vertical-align: top;
    }
  }

  .form {
    height: 100%;
    overflow: auto;
    width: 600px;
    flex-shrink: 0;
    border-left: 1px solid var(--border-color);

    .form-header {
      padding: 30px 20px;
      font-size: 18px;
      font-weight: bold;
      border-bottom: 1px solid var(--border-color);

      .form-title {
        display: flex;
        flex-wrap: wrap;
        align-items: center;

        .github-icon {
          margin-left: 5px;
          cursor: pointer;
        }
      }

      .form-description {
        margin-top: 20px;
        font-size: 12px;
        font-weight: normal;
        color: var(--info-color);
      }
    }

    .form-main {
      padding: 20px;

      .button-group {
        margin-top: 20px;

        .el-button {
          width: 100%;
        }
      }
    }
  }
}
</style>
