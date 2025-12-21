function onUse(event) {
    let player = event.getPlayer();
    let world = player.getWorld();
    let eyeLocation = player.getEyeLocation();
    let direction = eyeLocation.getDirection();
    let startLocation = eyeLocation.clone().subtract(0, 0.8, 0).add(direction);
    let maxDistance = 5;
    let rayTraceResults = world.rayTrace(startLocation, direction, maxDistance, org.bukkit.FluidCollisionMode.ALWAYS, true, 0, null);
  
    if (rayTraceResults == null) {
      return;
    }
  
    let entity = rayTraceResults.getHitEntity();
    console.log(entity.getCustomName());
    console.log(entity.getScoreboardTags());
}