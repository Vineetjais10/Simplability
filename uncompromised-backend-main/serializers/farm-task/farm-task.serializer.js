// serializers/farmTask.serializer.js

const farmTaskSerializer = farmTasks => {
  const data = !Array.isArray(farmTasks) ? [farmTasks] : farmTasks;
  const response = data.map(farmTask => ({
    id: farmTask.id,
    farm_id: farmTask.farm_id,
    task_id: farmTask.task_id,
    user_id: farmTask.user_id,
    crop_id: farmTask.crop_id,
    assigned_at: farmTask.assigned_at,
    instructions: farmTask.instructions,
    remarks: farmTask.remarks,
    priority: farmTask.priority,
    status: farmTask.status,
    task_status: farmTask.task_status,
    created_at: farmTask.created_at,
    proof: farmTask?.FarmTaskProofs?.[0] ? farmTask?.FarmTaskProofs[0]?.id : null,
    updated_at: farmTask.updated_at,
    deleted_at: farmTask.deleted_at,
    task_name: farmTask.Task ? farmTask.Task.name : null,
    farm_name: farmTask.Farm ? farmTask.Farm.name : null,
    farm_image_url: farmTask.Farm ? farmTask.Farm.image_url : null,
    farm_plot: farmTask.Farm ? farmTask.Farm.plot : null,
    farm_address: farmTask.Farm ? farmTask.Farm.address : null,
    farm_location: farmTask.Farm ? farmTask.Farm.location : null,
    user_name: farmTask.User ? farmTask.User.name : null,
    username: farmTask.User ? farmTask.User.username : null,
    crop_name: farmTask.Crop ? farmTask.Crop.name : null
  }));

  return Array.isArray(farmTasks) ? response : response.pop();
};

module.exports = { farmTaskSerializer };
