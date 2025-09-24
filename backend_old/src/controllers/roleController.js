const { AdminRole, User, ActivityLog } = require('../models');

/**
 * @desc    Get all admin roles
 * @route   GET /api/admin/roles
 * @access  Private/Admin
 */
const getAllRoles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      level,
      isActive
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (level) {
      query.level = parseInt(level);
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [roles, total] = await Promise.all([
      AdminRole.find(query)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ level: 1, name: 1 })
        .limit(parseInt(limit))
        .skip(skip),
      AdminRole.countDocuments(query)
    ]);

    // Add permission count to each role
    const rolesWithStats = roles.map(role => ({
      ...role.toObject(),
      permissionCount: role.permissionCount,
      grantedPermissions: role.getGrantedPermissions()
    }));

    res.status(200).json({
      success: true,
      message: 'Admin roles retrieved successfully',
      data: {
        roles: rolesWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRoles: total,
          hasNext: skip + roles.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching roles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single admin role
 * @route   GET /api/admin/roles/:id
 * @access  Private/Admin
 */
const getRole = async (req, res) => {
  try {
    const role = await AdminRole.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Admin role not found'
      });
    }

    // Get users assigned to this role
    const assignedUsers = await User.find({ 
      adminRole: role._id,
      role: 'sub_admin',
      isActive: true 
    }).select('name email createdAt').limit(10);

    res.status(200).json({
      success: true,
      message: 'Admin role retrieved successfully',
      data: {
        role: {
          ...role.toObject(),
          permissionCount: role.permissionCount,
          grantedPermissions: role.getGrantedPermissions(),
          assignedUsers: assignedUsers.length,
          assignedUsersList: assignedUsers
        }
      }
    });

  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Create new admin role
 * @route   POST /api/admin/roles
 * @access  Private/Admin
 */
const createRole = async (req, res) => {
  try {
    const {
      name,
      description,
      level,
      permissions
    } = req.body;

    // Validation
    if (!name || !description || !level || !permissions) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, level, and permissions'
      });
    }

    // Check if role name already exists
    const existingRole = await AdminRole.findOne({ 
      name: name.trim(),
      isActive: true 
    });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists'
      });
    }

    // Validate level
    if (level < 1 || level > 10) {
      return res.status(400).json({
        success: false,
        message: 'Role level must be between 1 and 10'
      });
    }

    // Create role
    const role = await AdminRole.create({
      name: name.trim(),
      description: description.trim(),
      level: parseInt(level),
      permissions,
      createdBy: req.user.id
    });

    await role.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Admin role created successfully',
      data: {
        role: {
          ...role.toObject(),
          permissionCount: role.permissionCount,
          grantedPermissions: role.getGrantedPermissions()
        }
      }
    });

  } catch (error) {
    console.error('Create role error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update admin role
 * @route   PUT /api/admin/roles/:id
 * @access  Private/Admin
 */
const updateRole = async (req, res) => {
  try {
    const {
      name,
      description,
      level,
      permissions,
      isActive
    } = req.body;

    const role = await AdminRole.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Admin role not found'
      });
    }

    // Check if new name conflicts with existing role
    if (name && name !== role.name) {
      const existingRole = await AdminRole.findOne({ 
        name: name.trim(),
        _id: { $ne: req.params.id },
        isActive: true 
      });

      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Role with this name already exists'
        });
      }
    }

    // Store old values for logging
    const oldValues = {
      name: role.name,
      description: role.description,
      level: role.level,
      permissions: role.permissions,
      isActive: role.isActive
    };

    // Update fields
    if (name) role.name = name.trim();
    if (description) role.description = description.trim();
    if (level) {
      if (level < 1 || level > 10) {
        return res.status(400).json({
          success: false,
          message: 'Role level must be between 1 and 10'
        });
      }
      role.level = parseInt(level);
    }
    if (permissions) role.permissions = permissions;
    if (isActive !== undefined) role.isActive = isActive;
    
    role.updatedBy = req.user.id;

    await role.save();
    await role.populate(['createdBy', 'updatedBy'], 'name email');

    res.status(200).json({
      success: true,
      message: 'Admin role updated successfully',
      data: {
        role: {
          ...role.toObject(),
          permissionCount: role.permissionCount,
          grantedPermissions: role.getGrantedPermissions()
        }
      }
    });

  } catch (error) {
    console.error('Update role error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete admin role
 * @route   DELETE /api/admin/roles/:id
 * @access  Private/Admin
 */
const deleteRole = async (req, res) => {
  try {
    const role = await AdminRole.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Admin role not found'
      });
    }

    // Check if role is assigned to any users
    const assignedUsers = await User.countDocuments({ 
      adminRole: role._id,
      role: 'sub_admin',
      isActive: true 
    });

    if (assignedUsers > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. It is assigned to ${assignedUsers} active user(s).`,
        assignedUsers
      });
    }

    await AdminRole.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Admin role deleted successfully',
      data: {
        deletedRole: {
          id: role._id,
          name: role.name,
          level: role.level
        }
      }
    });

  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Assign role to user
 * @route   POST /api/admin/roles/:id/assign
 * @access  Private/Admin
 */
const assignRole = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const role = await AdminRole.findById(req.params.id);
    if (!role || !role.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Admin role not found or inactive'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user role and assign admin role
    const oldRole = user.role;
    const oldAdminRole = user.adminRole;

    user.role = 'sub_admin';
    user.adminRole = role._id;
    user.createdBy = req.user.id;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Role assigned successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          adminRole: role.name
        },
        changes: {
          oldRole,
          newRole: 'sub_admin',
          assignedRole: role.name
        }
      }
    });

  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Revoke role from user
 * @route   POST /api/admin/roles/revoke
 * @access  Private/Admin
 */
const revokeRole = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const user = await User.findById(userId).populate('adminRole', 'name');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'sub_admin') {
      return res.status(400).json({
        success: false,
        message: 'User is not a sub-admin'
      });
    }

    const oldAdminRole = user.adminRole;

    // Revert to regular user
    user.role = 'user';
    user.adminRole = undefined;
    user.createdBy = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Role revoked successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        changes: {
          oldRole: 'sub_admin',
          newRole: 'user',
          revokedRole: oldAdminRole?.name
        }
      }
    });

  } catch (error) {
    console.error('Revoke role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while revoking role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get role statistics
 * @route   GET /api/admin/roles/stats
 * @access  Private/Admin
 */
const getRoleStats = async (req, res) => {
  try {
    const [
      totalRoles,
      activeRoles,
      totalSubAdmins,
      roleDistribution
    ] = await Promise.all([
      AdminRole.countDocuments(),
      AdminRole.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'sub_admin', isActive: true }),
      AdminRole.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'adminRole',
            as: 'assignedUsers'
          }
        },
        {
          $project: {
            name: 1,
            level: 1,
            assignedCount: { $size: '$assignedUsers' },
            permissionCount: {
              $size: {
                $filter: {
                  input: { $objectToArray: '$permissions' },
                  cond: { $gt: [{ $size: { $objectToArray: '$$this.v' } }, 0] }
                }
              }
            }
          }
        },
        { $sort: { level: 1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      message: 'Role statistics retrieved successfully',
      data: {
        summary: {
          totalRoles,
          activeRoles,
          inactiveRoles: totalRoles - activeRoles,
          totalSubAdmins,
          averageAssignments: totalSubAdmins / (activeRoles || 1)
        },
        roleDistribution
      }
    });

  } catch (error) {
    console.error('Get role stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching role statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  assignRole,
  revokeRole,
  getRoleStats
};