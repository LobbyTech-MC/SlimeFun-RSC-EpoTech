const playerUsageCount = new Map();

function onWeaponHit(event, player, item) {
    let sfItem = getSfItemByItem(item);
    if ("JP_DLKLJ" !== sfItem.getId()) {
        player.sendMessage("主手请持物品");
        return;
    }

    const entity = event.getEntity();
    if (entity instanceof org.bukkit.entity.WitherSkeleton) {
        entity.setHealth(0);
        const world = entity.getWorld();
        const location = entity.getLocation();
        const skullItemStack = new org.bukkit.inventory.ItemStack(org.bukkit.Material.WITHER_SKELETON_SKULL);
        world.dropItemNaturally(location, skullItemStack);

        const playerId = player.getUniqueId().toString();
        if (!playerUsageCount.has(playerId)) {
            playerUsageCount.set(playerId, 0);
        }
        let usageCount = playerUsageCount.get(playerId);
        usageCount++;
        playerUsageCount.set(playerId, usageCount);

        const itemMeta = item.getItemMeta();
        const lore = itemMeta.getLore().slice(0, -2);
        lore.push(`§e║§9§l剩余次数 : ${10 - usageCount}`);
        lore.push('§e╚════════════════════════════════════╝');
        itemMeta.setLore(lore);
        item.setItemMeta(itemMeta);
        if (usageCount >= 10) {
            player.getInventory().removeItem(item);
            playerUsageCount.delete(playerId);
        }
    } else {
        player.sendMessage("请攻击凋零骷髅");
    }
}