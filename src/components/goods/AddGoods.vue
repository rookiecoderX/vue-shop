<template>
  <div class="addgoods-container">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-alert title="添加商品信息" type="info" show-icon center></el-alert>
      <el-steps :active="activeStep-0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addForm" ref="addFormRef" :rules="addFormRules" label-position="top">
        <el-tabs
          tab-position="left"
          v-model="activeStep"
          :before-leave="beforeTabChange"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name" placeholder="商品名称"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" type="number">
              <el-input v-model="addForm.goods_price" placeholder="商品价格"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addForm.goods_weight" placeholder="商品重量"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="addForm.goods_number" placeholder="商品数量"></el-input>
            </el-form-item>
            <el-form-item label="商品种类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cascaderPorps"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyAttr" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="attr in item.attr_vals" :key="attr" :label="attr" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="attr in onlyAttr" :key="attr.attr_id" :label="attr.attr_name">
              <el-input v-model="attr.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 上传图片请求地址 -->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerConfig"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button class="btn-mt20" type="primary" @click="submitGoodsForm">完成</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <img class="img-center" :src="previewPath" alt />
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeStep: '0',
      // 存放表单内容
      addForm: {
        goods_name: '',
        goods_price: null,
        goods_weight: null,
        goods_number: null,
        goods_cat: [1, 3, 6],
        // 上传图片信息
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品种类', trigger: 'blur' }
        ]
      },
      cateList: [],
      // cascader配置对象
      cascaderPorps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 商品参数
      manyAttr: [],
      onlyAttr: [],
      headerConfig: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览路径
      previewPath: '',
      // 删除图片对话框flag
      previewDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data } = await this.$http.get('/categories')
      this.$showMessage(data, 200, false)
      this.cateList = data.data
    },
    beforeTabChange(activeName, oldActiveName) {
      if (activeName - oldActiveName > 1) {
        this.$message.error('请一步一步来哟')
        return false
      }
      if (
        oldActiveName === '0' &&
        (this.addForm.goods_name === '' || this.addForm.goods_cat.length === 0)
      ) {
        this.$message.error('请完整填写商品信息')
        return false
      }
    },
    async tabClicked() {
      // 判断点击tab的index

      if (this.activeStep === '1') {
        const { data } = await this.$http.get(
          `/categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        this.$showMessage(data, 200, false)
        data.data.forEach(item => {
          item.attr_vals =
            item.attr_vals === '' ? [] : item.attr_vals.split(' ')
        })
        this.manyAttr = data.data
      } else if (this.activeStep === '2') {
        const { data } = await this.$http.get(
          `/categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        this.onlyAttr = data.data
      }
    },
    // 图片预览
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 图片删除
    handleRemove(file) {
      this.addForm.pics.splice(
        this.addForm.pics.findIndex(
          item => item === file.response.data.tmp_name
        ),
        1
      )
    },
    handleSuccess(res) {
      const picInfo = { pic: res.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    submitGoodsForm() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请完成填写表单项')
        }
        // 处理提交的数据, lodash深拷贝addForm
        this.manyAttr.forEach(item => {
          const temp = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(temp)
        })
        this.onlyAttr.forEach(item => {
          const temp = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(temp)
        })
        const formdata = _.cloneDeep(this.addForm)
        formdata.goods_cat = formdata.goods_cat.join(',')
        const { data } = await this.$http.post('/goods', formdata)
        this.$showMessage(data, 201, true)
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      return this.addForm.goods_cat[this.addForm.goods_cat.length - 1]
    }
  }
}
</script>
<style lang='less' scoped>
.addgoods-container {
  .btn-mt20 {
    margin-top: 20px;
  }
  .img-center {
    width: 100%;
  }
}
</style>
