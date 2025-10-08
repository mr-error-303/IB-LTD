const { Permission, Role, ActivityLog } = require('../models');

/**
 * Get all permissions
 * @desc    Get all available permissions with filtering and pagination
 * @route   GET /api/admin/permissions
 * @access  Private/Admin
 */
const getAllPermissions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const permissions = await Permission.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalPermissions = await Permission.countDocuments(query);

    // Get usage statistics for each permission
    const permissionUsage = await Role.aggregate([
      { $unwind: '$permissions' },
      { $group: { _id: '$permissions', roleCount: { $sum: 1 } } }
    ]);

    // Add usage stats to permissions
    const permissionsWithStats = permissions.map(permission => {
      const usage = permissionUsage.find(u => u._id.toString() === permission._id.toString());
      return {
        ...permission,
        usedInRoles: usage ? usage.roleCount : 0
      };
    });

    // Get unique categories
    const categories = await Permission.distinct('category');

    // Log activity
    await ActivityLog.logActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'view_permissions',
      category: 'permission_management',
      description: `Viewed permissions list (page ${page})`,
      details: {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        category,
        totalPermissions,
        resultsCount: permissions.length
      },
      severity: 'low',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Permissions retrieved successfully',
      data: {
        permissions: permissionsWithStats,
        categories,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPermissions / parseInt(limit)),
          totalPermissions,
          hasNextPage: parseInt(page) < Math.ceil(totalPermissions / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting permissions:', error);
    
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Error retrieving permissions' 
        : error.message
    });
  }
};

/**
 * Get permission by ID
 * @desc    Get a specific permission with its usage details
 * @route   GET /api/admin/permissions/:id
 * @access  Private/Admin
 */
const getPermission = async (req, res) => {
  try {
    const { id } = req.params;

    const permission = await Permission.findById(id).lean();

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    // Get roles that use this permission
    const rolesUsingPermission = await Role.find({ 
      permissions: id,
      isActive: true 
    })
    .select('name description level')
    .lean();

    // Log activity
    await ActivityLog.logActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'view_permission_details',
      category: 'permission_management',
      description: `Viewed details for permission: ${permission.name}`,
      targetType: 'permission',
      targetId: id,
      details: {
        permissionName: permission.name,
        category: permission.category,
        usedInRolesCount: rolesUsingPermission.length
      },
      severity: 'low',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Permission retrieved successfully',
      data: {
        permission: {
          ...permission,
          usedInRoles: rolesUsingPermission.length
        },
        rolesUsingPermission
      }
    });

  } catch (error) {
    console.error('Error getting permission:', error);
    
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Error retrieving permission' 
        : error.message
    });
  }
};

/**
 * Create new permission
 * @desc    Create a new permission
 * @route   POST /api/admin/permissions
 * @access  Private/Admin
 */
const createPermission = async (req, res) => {
  try {
    const { name, description, category, isActive = true } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Permission name is required'
      });
    }

    if (!category || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Permission category is required'
      });
    }

    // Check if permission name already exists
    const existingPermission = await Permission.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });

    if (existingPermission) {
      return res.status(400).json({
        success: false,
        message: 'Permission name already exists'
      });
    }

    // Create permission
    const permission = new Permission({
      name: name.trim(),
      description: description?.trim() || '',
      category: category.trim(),
      isActive,
      createdBy: req.user.id
    });

    await permission.save();

    // Log activity
    await ActivityLog.logActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'create_permission',
      category: 'permission_management',
      description: `Created new permission: ${permission.name}`,
      targetType: 'permission',
      targetId: permission._id.toString(),
      details: {
        permissionName: permission.name,
        description: permission.description,
        category: permission.category,
        isActive
      },
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: { permission }
    });

  } catch (error) {
    console.error('Error creating permission:', error);
    
    // Log failed creation
    try {
      await ActivityLog.logActivity({
        adminId: req.user?.id,
        adminName: req.user?.name || 'Unknown',
        adminEmail: req.user?.email || 'Unknown',
        action: 'create_permission_failed',
        category: 'permission_management',
        description: 'Failed to create permission',
        details: {
          error: error.message,
          requestBody: req.body
        },
        severity: 'high',
        status: 'failed',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (logError) {
      console.error('Error logging failed permission creation:', logError);
    }

    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Error creating permission' 
        : error.message
    });
  }
};

/**
 * Update permission
 * @desc    Update an existing permission
 * @route   PUT /api/admin/permissions/:id
 * @access  Private/Admin
 */
const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, isActive } = req.body;

    // Find existing permission
    const existingPermission = await Permission.findById(id);
    if (!existingPermission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    // Store original data for logging
    const originalData = {
      name: existingPermission.name,
      description: existingPermission.description,
      category: existingPermission.category,
      isActive: existingPermission.isActive
    };

    // Validation
    if (name && name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Permission name cannot be empty'
      });
    }

    if (category && category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Permission category cannot be empty'
      });
    }

    // Check if new name already exists (excluding current permission)
    if (name && name.trim() !== existingPermission.name) {
      const duplicatePermission = await Permission.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: id }
      });

      if (duplicatePermission) {
        return res.status(400).json({
          success: false,
          message: 'Permission name already exists'
        });
      }
    }

    // Update permission
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || '';
    if (category !== undefined) updateData.category = category.trim();
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedBy = req.user.id;
    updateData.updatedAt = new Date();

    const updatedPermission = await Permission.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log activity
    await ActivityLog.logActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'update_permission',
      category: 'permission_management',
      description: `Updated permission: ${updatedPermission.name}`,
      targetType: 'permission',
      targetId: id,
      details: {
        permissionName: updatedPermission.name,
        changes: updateData,
        originalData
      },
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Permission updated successfully',
      data: { permission: updatedPermission }
    });

  } catch (error) {
    console.error('Error updating permission:', error);
    
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Error updating permission' 
        : error.message
    });
  }
};

/**
 * Delete permission
 * @desc    Delete a permission (soft delete)
 * @route   DELETE /api/admin/permissions/:id
 * @access  Private/Admin
 */
const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    // Find permission
    const permission = await Permission.findById(id);
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    // Check if permission is used in any roles
    const rolesUsingPermission = await Role.countDocuments({ 
      permissions: id,
      isActive: true 
    });
    
    if (rolesUsingPermission > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete permission. It is used in ${rolesUsingPermission} active role(s)`,
        data: { roleCount: rolesUsingPermission }
      });
    }

    // Soft delete (mark as inactive)
    permission.isActive = false;
    permission.deletedAt = new Date();
    permission.deletedBy = req.user.id;
    await permission.save();

    // Log activity
    await ActivityLog.logActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'delete_permission',
      category: 'permission_management',
      description: `Deleted permission: ${permission.name}`,
      targetType: 'permission',
      targetId: id,
      details: {
        permissionName: permission.name,
        description: permission.description,
        category: permission.category,
        deletionType: 'soft_delete'
      },
      severity: 'high',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Permission deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting permission:', error);
    
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Error deleting permission' 
        : error.message
    });
  }
};

/**
 * Get permission statistics
 * @desc    Get statistics about permissions and their usage
 * @route   GET /api/admin/permissions/stats
 * @access  Private/Admin
 */
const getPermissionStats = async (req, res) => {
  try {
    // Get basic permission counts
    const [totalPermissions, activePermissions, inactivePermissions] = await Promise.all([
      Permission.countDocuments(),
      Permission.countDocuments({ isActive: true }),
      Permission.countDocuments({ isActive: false })
    ]);

    // Get category distribution
    const categoryStats = await Permission.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get permission usage in roles
    const permissionUsage = await Role.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$permissions' },
      {
        $lookup: {
          from: 'permissions',
          localField: 'permissions',
          foreignField: '_id',
          as: 'permissionInfo'
        }
      },
      { $unwind: '$permissionInfo' },
      {
        $group: {
          _id: '$permissions',
          permissionName: { $first: '$permissionInfo.name' },
          category: { $first: '$permissionInfo.category' },
          roleCount: { $sum: 1 }
        }
      },
      { $sort: { roleCount: -1 } },
      { $limit: 10 }
    ]);

    // Get unused permissions
    const usedPermissionIds = await Role.distinct('permissions', { isActive: true });
    const unusedPermissions = await Permission.find({
      _id: { $nin: usedPermissionIds },
      isActive: true
    }).select('name category').lean();

    // Log activity
    await ActivityLog.logActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'view_permission_stats',
      category: 'permission_management',
      description: 'Viewed permission statistics',
      details: {
        totalPermissions,
        activePermissions,
        inactivePermissions,
        categoryCount: categoryStats.length
      },
      severity: 'low',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Permission statistics retrieved successfully',
      data: {
        summary: {
          totalPermissions,
          activePermissions,
          inactivePermissions,
          usedPermissions: usedPermissionIds.length,
          unusedPermissions: unusedPermissions.length
        },
        categoryDistribution: categoryStats,
        mostUsedPermissions: permissionUsage,
        unusedPermissions
      }
    });

  } catch (error) {
    console.error('Error getting permission stats:', error);
    
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Error retrieving permission statistics' 
        : error.message
    });
  }
};

module.exports = {
  getAllPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionStats
};