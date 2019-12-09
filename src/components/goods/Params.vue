<template>
  <div class="params-container">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-alert title="只允许选择三级标签" type="warning" show-icon></el-alert>
      <el-row class="mtb-20 t-center">
        <el-col :span="3">
          <span>请选择商品分类:</span>
        </el-col>
        <el-col :span="12">
          <el-cascader
            clearable
            expand-trigger="hover"
            :options="cateList"
            :props="allCateProps"
            v-model="selectedId"
            @change="selectedIdChanged"
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" type="card" @tab-click="tabchanged">
        <el-tab-pane name="many" label="动态参数">
          <el-button
            size="mini"
            type="primary"
            :disabled="isUseAble"
            @click="dialogVisible=true"
          >添加参数</el-button>
          <el-table border stripe :data="manyAttributesList">
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <el-tag
                  closable
                  v-for="(item, i) in slotProps.row.attr_vals"
                  :key="item"
                  @close="handleClosed(i, slotProps.row)"
                >{{item}}</el-tag>
                <el-input
                  style="width: 100px"
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slotProps.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button class="el-icon-edit" type="primary" size="mini">添加</el-button>
                <el-button class="el-icon-delete" type="danger" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane name="only" label="静态属性">
          <el-button
            size="mini"
            type="primary"
            :disabled="isUseAble"
            @click="dialogVisible=true"
          >添加属性</el-button>
          <el-table border stripe :data="onlyAttributesList">
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <el-tag
                  closable
                  v-for="(item, i) in slotProps.row.attr_vals"
                  :key="item"
                  @close="handleClosed(i, slotProps.row)"
                >{{item}}</el-tag>
                <el-input
                  style="width: 100px"
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slotProps.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button class="el-icon-edit" type="primary" size="mini">添加</el-button>
                <el-button class="el-icon-delete" type="danger" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog
      :title="'添加'+addDialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      @close="dialogClose"
    >
      <el-form
        :model="addAttributeForm"
        ref="addAttributeRef"
        label-width="115px"
        :rules="addAttributeRules"
      >
        <el-form-item :label="addDialogTitle+'名称'" prop="attr_name">
          <el-input v-model="addAttributeForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="postAttrForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cateList: [],
      // 级联配置对象
      allCateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 级联选择框选中分类的数组id
      selectedId: [],
      activeName: 'many',
      onlyAttributesList: [],
      manyAttributesList: [],
      dialogVisible: false,
      addAttributeForm: {
        attr_name: ''
      },
      addAttributeRules: {
        attr_name: [
          { required: true, message: '该项不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data } = await this.$http.get('categories')
      this.cateList = data.data
    },
    selectedIdChanged() {
      this.getAttributes()
    },
    // tab栏切换
    tabchanged() {
      this.getAttributes()
    },
    async getAttributes() {
      if (this.selectedId.length === 0) return
      const { data } = await this.$http.get(
        `/categories/${this.selectedId[this.selectedId.length - 1]}/attributes`,
        { params: { sel: this.activeName } }
      )
      data.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      this[`${this.activeName}AttributesList`] = data.data
    },
    dialogClose() {
      this.$refs.addAttributeRef.resetFields()
    },
    postAttrForm() {
      this.$refs.addAttributeRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请正确填写表单')
        }
        const { data } = await this.$http.post(
          `/categories/${
            this.selectedId[this.selectedId.length - 1]
          }/attributes`,
          {
            attr_name: this.addAttributeForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (data.meta.status !== 201) {
          return this.$message.error(data.meta.msg)
        }
        this.$message.success(data.meta.msg)
        this.getAttributes()
        this.dialogVisible = false
      })
    },
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.editAttr(row)
    },
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除属性值
    async handleClosed(index, row) {
      // splice会修改原数组，返回删除的元素
      row.attr_vals.splice(index, 1)
      this.editAttr(row)
    },
    // 更改属性值的axios
    async editAttr(row) {
      await this.$http
        .put(
          `categories/${
            this.selectedId[this.selectedId.length - 1]
          }/attributes/${row.attr_id}`,
          {
            attr_name: row.attr_name,
            attr_sel: this.activeName,
            attr_vals: row.attr_vals.join(' ')
          }
        )
    }
  },
  computed: {
    isUseAble: function() {
      return this.selectedId === 0
    },
    addDialogTitle: function() {
      return this.activeName === 'only' ? '静态属性' : '动态参数'
    }
  }
}
</script>
<style lang='less' scoped>
.params-container {
  .mtb-20 {
    margin: 20px 0;
  }
  .t-center {
    display: flex;
    align-items: center;
  }
}
</style>
