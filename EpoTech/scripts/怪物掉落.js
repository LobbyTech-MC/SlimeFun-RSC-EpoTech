
//获取手中物品粘液id并进行对比
function handleItemInMainHand(player, slimefunItemId) {
  let itemInMainHand = player.getInventory().getItemInMainHand();
  let sfItem = getSfItemByItem(itemInMainHand);
  if (sfItem !== null) {
    return slimefunItemId === sfItem.getId();
  } else {
    return false;
  }
}

//追踪弓
function targetBow(player, e) {
  let world = player.getWorld();
  let eyeLocation = player.getEyeLocation();
  let direction = eyeLocation.getDirection();
  let startLocation = eyeLocation.clone().subtract(0, 0.8, 0).add(direction);
  let maxDistance = 50;
  let rayTraceResults = world.rayTrace(startLocation, direction, maxDistance, org.bukkit.FluidCollisionMode.ALWAYS, true, 0, null);

  if (rayTraceResults === null) {
    player.sendMessage("未设定追踪目标");
    return;
  }

  let entity = rayTraceResults.getHitEntity();
  if (entity !== null) {
    if ( entity instanceof org.bukkit.entity.Arrow){
      return;
    }
    if (entity instanceof org.bukkit.entity.Player) {
      if (entity.getGameMode() !== org.bukkit.GameMode.SURVIVAL) {
        player.sendMessage("你瞄准的是一位神权玩家");
        return;
      }
    }
    let arrow = e.getProjectile();
    runRepeating((t) => {
      updateArrowDirection(arrow, entity);
      if (arrow.isDead() || arrow.isInBlock()) {
        arrow.remove();
        player.sendMessage("已命中目标");
        t.cancel();
      }
    }, 10, 1);
  } else {
    player.sendMessage("未设定追踪目标");
  }
}


function updateArrowDirection(arrow, targetEntity) {
  let arrowLocation = arrow.getLocation();
  let targetLocation = targetEntity.getLocation().add(0, 0.8, 0).toVector();
  let direction = targetLocation.subtract(arrowLocation.toVector()).normalize();

  // 设置箭的飞行速度

  let multiplier = 0.7;
  arrow.setVelocity(direction.multiply(multiplier));
}


//散射弓
function sanshegong(player, event) {
  let force = event.getForce() * 4; // 力量加倍
  let world = player.getWorld();
  let eyeLocation = player.getEyeLocation();
  let direction = eyeLocation.getDirection();
    for (let i = 0; i < 20; i++) {
      world.spawnArrow(eyeLocation, direction, force, 10);
    }
  
}


function onEntityShootBow(e) {
  let entity = e.getEntity();
  if (entity instanceof org.bukkit.entity.Player) {
    let player = entity;
    if (handleItemInMainHand(player, "JP_SANSHEGONG")) {
      sanshegong(entity, e); // 散射弓
    }
    if (handleItemInMainHand(player, "JP_TARGETBOW")) {
      targetBow(player, e); // 追踪弓
    }
  }
}


function onEntityDeath(e) {
  let entity = e.getEntity();

  if (entity instanceof org.bukkit.entity.Slime) {
    if (entity.getSize() > 64) {
      let location = entity.getLocation();
      let world = location.getWorld();
      let slimefunItem = getSfItemById("JP_史莱姆精华");
      //let itemStack = new org.bukkit.inventory.ItemStack(slimefunItem.getItem());
      let itemStack = slimefunItem.getItem().clone();
      let randomValue = Math.random() * 100; // 生成0到100的随机浮点数
    
      // 如果随机值小于或等于物品的概率，则掉落该物品
      if (randomValue <= 30) {
        world.dropItemNaturally(location, itemStack);
      }
    }
  }
  if (entity instanceof org.bukkit.entity.MagmaCube) {
    if (entity.getSize() > 64) {
      let location = entity.getLocation();
      let world = location.getWorld();
      let slimefunItem = getSfItemById("JP_岩浆怪精华");
      //let itemStack = new org.bukkit.inventory.ItemStack(slimefunItem.getItem());
      let itemStack = slimefunItem.getItem().clone();
      let randomValue = Math.random() * 100; // 生成0到100的随机浮点数
    
      // 如果随机值小于或等于物品的概率，则掉落该物品
      if (randomValue <= 30) {
        world.dropItemNaturally(location, itemStack);
      }
    }
  }
}