const MODES = {
  INVISIBLE: {
    lore: "§4§lShift + 右键切换模式 : §2§l 隐形",
    action: false,
    message: "§a展示框已隐藏！"
  },
  VISIBLE: {
    lore: "§4§lShift + 右键切换模式 : §2§l 显示",
    action: true,
    message: "§a展示框已显示！"
  }
};

// 获取当前模式
function getCurrentMode(lore) {
  if (!lore) return MODES.INVISIBLE;
  return Object.values(MODES).find(mode => lore.includes(mode.lore)) || MODES.INVISIBLE;
}

// 获取下一个模式
function getNextMode(currentMode) {
  const modes = Object.values(MODES);
  const currentIndex = modes.findIndex(mode => mode.lore === currentMode.lore);
  return modes[(currentIndex + 1) % modes.length];
}

// 更新物品Lore
function updateLore(event) {
  const player = event.getPlayer();
  const item = event.getItem();
  
  if (!item || !item.getItemMeta) return;
  
  const itemMeta = item.getItemMeta();
  const lore = itemMeta.getLore() || [];
  const currentMode = getCurrentMode(lore);
  const newMode = getNextMode(currentMode);
  
  const newLore = lore.map(line => 
    line === currentMode.lore ? newMode.lore : line
  );
  
  itemMeta.setLore(newLore);
  item.setItemMeta(itemMeta);
  player.sendMessage(`§a模式切换至: ${newMode.lore.split("§2§l ")[1]}`);
}

// 处理交互
function onUse(event) {
  const player = event.getPlayer();
  const item = event.getItem();
  
  if (!player || !item) return;
  
  if (player.isSneaking()) {
    updateLore(event);
    return;
  }
  
  const rayTrace = player.getWorld().rayTrace(
    player.getEyeLocation(),
    player.getEyeLocation().getDirection(),
    5,
    org.bukkit.FluidCollisionMode.NEVER,
    true,
    0.1,
    e => e instanceof org.bukkit.entity.ItemFrame
  );
  
  if (rayTrace && rayTrace.getHitEntity()) {
    const frame = rayTrace.getHitEntity();
    const mode = getCurrentMode(item.getItemMeta().getLore());
    frame.setVisible(mode.action);
    player.sendMessage(mode.message);
  }
}