const playerUsageCount = new Map();
const MAIN_HAND = org.bukkit.inventory.EquipmentSlot.HAND;
const PROBABILITY = 0.01;          // 1% 基础触发概率
const EXPLOSION_PROBABILITY = 0.5; // 50% 基础触发后的爆炸概率（实际总概率 0.5%）
const EXPLOSION_DAMAGE = 100;      // 爆炸伤害

// 更新物品Lore
function updateItemLore(item, usageCount) {
    const itemMeta = item.getItemMeta();
    if (!itemMeta.hasLore()) return false;
    
    const lore = itemMeta.getLore();
    lore.splice(-2, 2);
    lore.push(`§e║§x§c§2§2§a§f§b你已手冲:${usageCount}次`);
    lore.push('§e╚════════════════════════════════════╝');
    itemMeta.setLore(lore);
    item.setItemMeta(itemMeta);
    return true;
}

// 处理饥饿效果
function applyHungerEffect(player) {
    if (player.getFoodLevel() <= 0) {
        player.setHealth(0);
        org.bukkit.Bukkit.broadcastMessage(`${player.getName()}死于手冲过度`);
        return true; // 返回是否死亡
    }
    player.setFoodLevel(0);
    player.setSaturation(0);
    return false;
}

// 处理爆炸效果
function applyExplosionEffect(player) {
    const location = player.getLocation();
    player.getWorld().createExplosion(
        location.getX(),
        location.getY(),
        location.getZ(),
        4.0,    // 爆炸威力
        false,  // 是否破坏方块
        false   // 是否产生火焰
    );
    player.damage(EXPLOSION_DAMAGE);
    player.sendMessage("§4你因手冲过度而爆炸了！");
    org.bukkit.Bukkit.broadcastMessage(`${player.getName()}因手冲过度而爆炸了！`);
}

function onUse(event) {
    // 检查是否为主手
    if (event.getHand() !== MAIN_HAND) {
        event.getPlayer().sendMessage("主手请持物品");
        return;
    }

    const player = event.getPlayer();
    const playerId = player.getUniqueId();
    const item = player.getInventory().getItemInMainHand();

    // 更新使用次数和Lore
    const newCount = (playerUsageCount.get(playerId) || 0) + 1;
    playerUsageCount.set(playerId, newCount);
    if (!updateItemLore(item, newCount)) return;

    // 1% 概率触发随机事件
    if (Math.random() < PROBABILITY) {
        // 先处理饥饿效果
        const isDead = applyHungerEffect(player);
        if (isDead) {
            playerUsageCount.set(playerId, 0);
            return; // 如果玩家死亡，不再执行后续逻辑
        }

        // 在1%触发的基础上，50%概率爆炸（实际总概率0.5%）
        if (Math.random() < EXPLOSION_PROBABILITY) {
            applyExplosionEffect(player);
        }
    }
}