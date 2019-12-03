<template>
  <div class="cate-container">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      <tree-table
        :data="cateLists"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        class="mt-20"
      >
        <!-- 是否有效模板 -->
        <template v-slot:isok="slotProps">
          <i class="el-icon-success" v-if="!slotProps.row.cat_deleted" style="color: green"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- level -->
        <template v-slot:sort="slotProps">
          <el-tag size="mini" v-if="slotProps.row.cat_level==0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="slotProps.row.cat_level==1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- operation -->
        <template v-slot:operation="slotProps">
          <el-button type="primary" class="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" class="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <el-pagination
        class="mar-center"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="cateInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="cateInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClose"
    >
      <el-form :model="addCateInfo" ref="addCateRef" label-width="80px" :rules="addCaterules">
        <el-form-item label="父级分类">
          <!-- v-model必须是个数组 -->
          <el-cascader
            v-model="selectedId"
            :options="parentCateList"
            :props="cascaderPorps"
            clearable
            change-on-select
            @change="selectedIdChanged"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateInfo.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click=" addCateDialogVisible= false">取 消</el-button>
        <el-button type="primary" @click="submitAddCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cateLists: [],
      cateInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isok' },
        { label: '排序', type: 'template', template: 'sort' },
        { label: '操作', type: 'template', template: 'operation' }
      ],
      addCateDialogVisible: false,
      addCateInfo: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCaterules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      parentCateList: [],
      cascaderPorps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedId: []
    }
  },
  created() {
    this.getCateLists()
  },
  methods: {
    async getCateLists() {
      const { data } = await this.$http.get('/categories', {
        params: this.cateInfo
      })
      this.cateLists = data.data.result
      this.total = data.data.total
    },
    handleSizeChange(val) {
      this.cateInfo.pagesize = val
      this.getCateLists()
    },
    handleCurrentChange(val) {
      this.cateInfo.pagenum = val
      this.getCateLists()
    },
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类， 只获取二级父级分类
    async getParentCateList() {
      const { data } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      this.parentCateList = data.data
    },
    selectedIdChanged() {
      this.addCateInfo.cat_pid =
        this.selectedId[this.selectedId.length - 1] || 0
      this.addCateInfo.cat_level = this.selectedId.length
    },
    submitAddCate() {
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请正确填写表单')
        }
        const { data } = await this.$http.post('categories', this.addCateInfo)
        console.log(data)
        if (data.meta.status !== 201) {
          return this.$message.error(data.meta.msg)
        }
        this.$message.success(data.meta.msg)
        this.getCateLists()
        this.addCateDialogVisible = false
      })
    },
    addCateDialogClose() {
      this.$refs.addCateRef.resetFields()
      this.selectedId = []
      this.addCateInfo.cat_pid = 0
      this.addCateInfo.cat_level = 0
    }
  }
}
</script>
<style lang='less' scoped>
.cate-container {
  .mt-20 {
    margin-top: 20px;
  }
}
</style>
