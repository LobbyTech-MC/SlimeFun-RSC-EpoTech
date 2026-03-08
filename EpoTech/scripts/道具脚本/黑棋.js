const directions = [
  {modX: 1, modZ: 0}, // 水平
  {modX: 0, modZ: 1}, // 垂直
  {modX: 1, modZ: 1}, // 对角线1
  {modX: -1, modZ: 1}, // 对角线2
  {modX: -1, modZ: -1}, // 对角线3
];


var BlockTypes = Packages.com.sk89q.worldedit.world.block.BlockTypes;
var BlockVector3 = Packages.com.sk89q.worldedit.math.BlockVector3;
var BukkitAdapter = Packages.com.sk89q.worldedit.bukkit.BukkitAdapter;
var WorldEdit = Packages.com.sk89q.worldedit.WorldEdit;

function onUse(event) {
  let player = event.getPlayer();
  let block = player.getTargetBlock(null, 10);

  if (block.isEmpty() || block.getType() !== org.bukkit.Material.WHITE_STAINED_GLASS) {
    player.sendMessage("请对准棋盘放置");
    return;
  }

  let location = block.getLocation().add(0, 1, 0);
  let world = block.getWorld();
  var faweworld = BukkitAdapter.adapt(world);
  var editSession = WorldEdit.getInstance().newEditSession(faweworld);
  var blockType = BlockTypes.POLISHED_BLACKSTONE_BUTTON.getDefaultState();
  var x = location.getBlockX();
  var y = location.getBlockY() + 1;
  var z = location.getBlockZ();
  var position = BlockVector3.at(x, y, z);
  if (world.getBlockAt(location).getType() === org.bukkit.Material.AIR) {
      let buttonBlock = world.getBlockAt(location);
      buttonBlock.setType(org.bukkit.Material.POLISHED_BLACKSTONE_BUTTON, false);

	  try {
		editSession.setBlock(position, blockType);
		editSession.flushSession(); 
	  } catch (e) {
        player.sendMessage("放置失败, 发生了一些异常错误，请联系管理员或重新放置！ ");
      } finally {
		editSession.close();
      }
      let buttonData = buttonBlock.getBlockData();
      if (buttonData instanceof org.bukkit.block.data.type.Switch) {
          buttonData.setAttachedFace(org.bukkit.block.data.FaceAttachable.AttachedFace.FLOOR);
          buttonBlock.setBlockData(buttonData);

          if (checkForWin(location, world)) {
            org.bukkit.Bukkit.broadcastMessage("恭喜" + player.getName() + "获得了本次五子棋对局胜利");
            player.sendMessage("对局结束,请前往拆除棋盘核心,重新放置后开始新一轮对局");
          } else {
            player.sendMessage("放置成功，继续下棋");
          }
      } else {
          player.sendMessage("放置失败，请重新放置");
      }
  } else {
      player.sendMessage("无法放置该区域，请拆除棋盘上面的方块");
  }
}

function checkForWin(location, world) {
  for (let direction of directions) {
    if (countChain(location, world, direction) >= 5) {
      return true;
    }
  }
  return false;
}

function countChain(location, world, direction) {
  let count = 1;
  let startX = location.getBlockX();
  let startY = location.getBlockY();
  let startZ = location.getBlockZ();
  
  // 向前检查
  for (let i = 1; i < 5; i++) { // 检查四个棋子是否连成一线
    let x = startX + direction.modX * i;
    let z = startZ + direction.modZ * i;
    let nextBlock = world.getBlockAt(x, startY, z);
    if (nextBlock != null && nextBlock.getType() === org.bukkit.Material.POLISHED_BLACKSTONE_BUTTON) {
      count++;
    } else {
      break;
    }
  }
  
  // 向后检查
  for (let i = 1; i < 5; i++) { // 检查四个棋子是否连成一线
    let x = startX - direction.modX * i;
    let z = startZ - direction.modZ * i;
    let nextBlock = world.getBlockAt(x, startY, z);
    if (nextBlock != null && nextBlock.getType() === org.bukkit.Material.POLISHED_BLACKSTONE_BUTTON) {
      count++;
    } else {
      break;
    }
  }
  return count;
}