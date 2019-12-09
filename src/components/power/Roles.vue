<template>
  <div class="roles-container">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-button type="primary" class="btn-add" @click="addRoleVisible = true">添加角色</el-button>
      <template>
        <el-table :data="rolesList" stripe border style="width: 100%">
          <!-- 展开列 -->
          <el-table-column type="expand">
            <template v-slot="slotProps">
              <el-row
                :class="['bor-bottom', index1===0?'bor-top':'', 'v-center']"
                v-for="(firstItem, index1) in slotProps.row.children"
                :key="firstItem.id"
              >
                <!-- 一级权限 -->
                <el-col :span="5" class="disflex">
                  <el-tag
                    closable
                    @close="removeRightById(slotProps.row, firstItem.id)"
                  >{{firstItem.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="19">
                  <!-- 二级权限 -->
                  <el-row
                    v-for="(secondItem, index2) in firstItem.children"
                    :class="[index2===firstItem.children.length-1?'':'bor-bottom', 'v-center']"
                    :key="secondItem.id"
                  >
                    <el-col :span="6">
                      <el-tag
                        type="success"
                        closable
                        @close="removeRightById(slotProps.row, secondItem.id)"
                      >{{secondItem.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <!-- 三级权限 -->
                      <el-tag
                        type="warning"
                        v-for="(thirdItem) in secondItem.children"
                        :key="thirdItem.id"
                        closable
                        @close="removeRightById(slotProps.row, thirdItem.id)"
                      >{{thirdItem.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="roleName" label="角色名称"></el-table-column>
          <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
          <el-table-column label="操作">
            <template v-slot="slotProps">
              <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="deleteRole(slotProps.row.id)"
              >删除</el-button>
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-setting"
                @click="showSetRightsDialog(slotProps.row)"
              >分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
    <el-dialog title="分配权限" :visible.sync="setRightDialaoVisible" width="50%">
      <el-tree
        ref="treeRef"
        :data="allRights"
        :props="defaultProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="defKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialaoVisible = false">取 消</el-button>
        <el-button type="primary" @click="completeRights">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="添加角色" :visible.sync="addRoleVisible" width="50%">
      <el-form label-width="80px" :model="addRoleInfo" :rules="addRoleDialogRules" ref="addRoleRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rolesList: [],
      setRightDialaoVisible: false,
      // 所有权限
      allRights: [],
      defaultProps: {
        label: 'authName',
        children: 'children'
      },
      // 树表中默认选中的数组
      defKeys: [],
      // 当前dialog对应角色的id
      currentRoleId: 0,
      // 添加角色flag
      addRoleVisible: false,
      // 角色信息
      addRoleInfo: {
        roleName: '',
        roleDesc: ''
      },
      addRoleDialogRules: {
        roleName: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data } = await this.$http.get('/roles')
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      this.rolesList = data.data
    },
    // 删除权限
    async removeRightById(role, rightId) {
      const res = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (res === 'confirm') {
        const { data } = await this.$http.delete(
          `/roles/${role.id}/rights/${rightId}`
        )
        if (data.meta.status !== 200) {
          return this.$message.error(data.meta.msg)
        }
        role.children = data.data
        this.$message.success(data.meta.msg)
      }
    },
    async showSetRightsDialog(role) {
      const { data } = await this.$http.get('/rights/tree')
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      this.currentRoleId = role.id
      this.allRights = data.data
      this.getLeavesLists(role, this.defKeys)
      this.setRightDialaoVisible = true
    },
    // 通过递归获取三级权限
    getLeavesLists(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeavesLists(item, arr)
      })
    },
    // 提交添加后的权限
    async completeRights() {
      const arr = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const arrStr = arr.join(',')
      const { data } = await this.$http.post(
        `/roles/${this.currentRoleId}/rights`,
        { rids: arrStr }
      )
      if (data.meta.status !== 200) {
        return this.$message.error(data.meta.msg)
      }
      this.getRolesList()
      this.setRightDialaoVisible = false
      this.$message.success(data.meta.msg)
    },
    async addRole() {
      if (!this.$refs.addRoleRef.validate) {
        return this.$message.error('请正确填写角色信息')
      }
      const { data } = await this.$http.post('/roles', this.addRoleInfo)
      if (data.meta.status !== 201) {
        return this.$message.error(data.meta.msg)
      }
      this.getRolesList()
      this.addRoleVisible = false
      this.$message.success(data.meta.msg)
    },
    async deleteRole(id) {
      const res = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (res === 'confirm') {
        const { data } = await this.$http.delete(`/roles/${id}`)
        if (data.meta.status !== 200) {
          return this.$message.error(data.meta.msg)
        }
        this.getRolesList()
        this.$message.success(data.meta.msg)
      }
    }
  },
  watch: {
    setRightDialaoVisible: function() {
      !this.setRightDialaoVisible && (this.defKeys = [])
    },
    addRoleVisible: function() {
      !this.addRoleVisible && this.$refs.addRoleRef.resetFields()
    }
  }
}
</script>
<style lang='less' scoped>
.roles-container {
  .box-card {
    margin-top: 20px;
    .btn-add {
      margin-bottom: 20px;
    }
    .bor-top {
      border-top: 1px solid #ccc;
    }
    .bor-bottom {
      border-bottom: 1px solid #ccc;
    }
    .el-tag {
      margin: 20px 10px;
    }
    .v-center {
      display: flex;
      align-items: center;
    }
  }
}
</style>
