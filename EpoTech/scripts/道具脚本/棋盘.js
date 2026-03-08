var range = 20;
var Type = org.bukkit.Material.WHITE_STAINED_GLASS;

var white = org.bukkit.Material.ACACIA_BUTTON;
var black = org.bukkit.Material.POLISHED_BLACKSTONE_BUTTON;

var lastActionTime = {};

var BlockTypes = Packages.com.sk89q.worldedit.world.block.BlockTypes;
var BlockVector3 = Packages.com.sk89q.worldedit.math.BlockVector3;
var BukkitAdapter = Packages.com.sk89q.worldedit.bukkit.BukkitAdapter;
var WorldEdit = Packages.com.sk89q.worldedit.WorldEdit;

function place(location, world, Type, range) {
    // 1. 获取 FAWE 适配的世界对象
    var faweworld = BukkitAdapter.adapt(world);
    
    // 2. 获取方块状态 (BlockState)
    // 注意：如果是 WHITE_STAINED_GLASS，FAWE 内部对应 BlockTypes.WHITE_STAINED_GLASS
    var blockType = BlockTypes.parse(Type.name()).getDefaultState();

    // 3. 构建 EditSession (FAWE 推荐方式)
    // 2.15.1 版本通常通过 WorldEdit.getInstance().newEditSession(faweworld) 获取
    var editSession = WorldEdit.getInstance().newEditSession(faweworld);
    
    try {
        for (let dx = -range; dx <= range; dx++) {
            for (let dz = -range; dz <= range; dz++) {
                // 使用整数坐标构建 BlockVector3
                var x = location.getBlockX() + dx;
                var y = location.getBlockY();
                var z = location.getBlockZ() + dz;
                
                var position = BlockVector3.at(x, y, z);
				
				if (editSession.getBlock(position).getBlockType() === BlockTypes.AIR) {
					// 4. 设置方块 (这是异步队列操作)
					editSession.setBlock(position, blockType);
				}
                
                
            }
        }
        // 5. 关键：在循环外统一刷新并关闭
        editSession.flushSession(); 
    } catch (e) {
        player.sendMessage("放置失败, 发生了一些异常错误，请联系管理员！ ");
    } finally {
        editSession.close();
    }
}

function isInCooldown(playerUUID) {
  let lastTime = lastActionTime[playerUUID];
  if (lastTime) {
    let currentTime = new Date().getTime();
    return (currentTime - lastTime) < 600; // 6000毫秒等于1分钟
  }
  return false;
}

function setLastActionTime(playerUUID) {
  lastActionTime[playerUUID] = new Date().getTime();
}

function placeAndRemoval(event, range) {
  let block = event.getBlock();
  let location = block.getLocation();
  let world = block.getWorld();

  place(location, world, Type, range);

  //runLater(() => remove(location, world, Type, white, black, range), delay);
}


function remove(location, world, Type, range) {
    // 1. 获取 FAWE 适配的世界对象
    var faweworld = BukkitAdapter.adapt(world);
    
    // 2. 获取方块状态 (BlockState)
    // 注意：如果是 WHITE_STAINED_GLASS，FAWE 内部对应 BlockTypes.WHITE_STAINED_GLASS
    var blockType = BlockTypes.parse(Type.name());

    // 3. 构建 EditSession (FAWE 推荐方式)
    // 2.15.1 版本通常通过 WorldEdit.getInstance().newEditSession(faweworld) 获取
    var editSession = WorldEdit.getInstance().newEditSession(faweworld);
    
    try {
        for (let dx = -range; dx <= range; dx++) {
            for (let dz = -range; dz <= range; dz++) {
                // 使用整数坐标构建 BlockVector3
                var x = location.getBlockX() + dx;
                var y = location.getBlockY();
                var z = location.getBlockZ() + dz;
                
                var position = BlockVector3.at(x, y, z);
				
				if (editSession.getBlock(position).getBlockType() === blockType) {
					// 4. 设置方块 (这是异步队列操作)
					editSession.setBlock(position, BlockTypes.AIR.getDefaultState());
				}
                
                
            }
        }
        // 5. 关键：在循环外统一刷新并关闭
        editSession.flushSession(); 
    } catch (e) {
        player.sendMessage("放置失败, 发生了一些异常错误，请联系管理员！ ");
    } finally {
        editSession.close();
    }
}

function removeBUTTON(location, world, white, black, range) {
    // 1. 获取 FAWE 适配的世界对象
    var faweworld = BukkitAdapter.adapt(world);
    
    // 2. 获取方块状态 (BlockState)
    // 注意：如果是 WHITE_STAINED_GLASS，FAWE 内部对应 BlockTypes.WHITE_STAINED_GLASS
    var whiteType = BlockTypes.parse(white.name());
	var blackType = BlockTypes.parse(black.name());

    // 3. 构建 EditSession (FAWE 推荐方式)
    // 2.15.1 版本通常通过 WorldEdit.getInstance().newEditSession(faweworld) 获取
    var editSession = WorldEdit.getInstance().newEditSession(faweworld);
    
    try {
        for (let dx = -range; dx <= range; dx++) {
            for (let dz = -range; dz <= range; dz++) {
				for (let dy = 0; dy <= 2; dy++){
					// 使用整数坐标构建 BlockVector3
					var x = location.getBlockX() + dx;
					var y = location.getBlockY() + dy;
					var z = location.getBlockZ() + dz;
					
					var position = BlockVector3.at(x, y, z);
					
					if (editSession.getBlock(position).getBlockType() === whiteType || 
						editSession.getBlock(position).getBlockType() === blackType) {
						// 4. 设置方块 (这是异步队列操作)
						editSession.setBlock(position, BlockTypes.AIR.getDefaultState());
					}
				} 
            }
        }
        // 5. 关键：在循环外统一刷新并关闭
        editSession.flushSession(); 
    } catch (e) {
        player.sendMessage("放置失败, 发生了一些异常错误，请联系管理员或重新放置！ ");
    } finally {
        editSession.close();
    }
}

function onPlace(event) {

  let player = event.getPlayer();

  // 检查玩家是否在冷却时间内
  if (isInCooldown(player.getUniqueId())) {
    player.sendMessage("操作太频繁，请等待一段时间后再试。");
    return;
  }

  if(event.getPlayer() instanceof org.bukkit.entity.Player){
    placeAndRemoval(event, range);
  }
  setLastActionTime(player.getUniqueId());
}

function onBreak(event) {
  let block = event.getBlock();
  let location = block.getLocation();
  let world = block.getWorld();
  removeBUTTON(location, world, white, black, range);
  remove(location, world, Type, range);
}