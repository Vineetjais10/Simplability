const COLUMN_HEADINGS = {
  TASK: 'Task',
  CATEGORY: 'Category',
  FARM: 'Farm',
  CROP: 'Crop',
  ASSIGNED_FIELD_USER: 'Assigned Field User',
  FIELD_USER: 'Field User',
  USERNAME: 'Username',
  FIELD_USER_ID: 'Field User Id',
  ASSIGNED_DATE: 'Assigned Date',
  INSTRUCTIONS: 'Instructions',
  DETAILS: 'Details',
  REMARKS: 'Remarks',
  SPECIAL_INSTRUCTIONS: 'Special Instructions',
  PRIORITY: 'Priority',
  FARM_ADDRESS: 'Farm Address',
  FARM_LOCATION: 'Farm Location',
  FARM_IMAGE: 'Farm Image',
  PLOT: 'Plot',
  USER_ADDRESS: 'User Address'
};

const TASK_NAME = {
  FIELD_PREPERATION: 'Field Preparation',
  SOWING: 'Sowing',
  WEEDING: 'Weeding',
  IRRIGATION: 'Irrigation',
  SPRAYING: 'Spraying',
  HARVESTING: 'Harvesting',
  MAINTENANCE: 'Maintenance',
  OTHER: 'Other'
};

const REQUIRED_PRIORITY = {
  EMPTY_STRING: '',
  NORMAL: 'normal',
  MODERATE: 'moderate',
  CRITICAL: 'critical'
};

module.exports = { COLUMN_HEADINGS, TASK_NAME, REQUIRED_PRIORITY };
