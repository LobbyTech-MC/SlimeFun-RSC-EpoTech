let ItemStack = org.bukkit.inventory.ItemStack;
let Material = org.bukkit.Material;
//安全获取物品
function getItemSafe(item) {
  if (item === null) {
    return new ItemStack(Material.AIR);
  }
  let safeItem = new ItemStack(item.getType());
  safeItem.setAmount(item.getAmount());
  if (item.hasItemMeta()) {
    safeItem.setItemMeta(item.getItemMeta());
  }
  return safeItem;
}
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
  if (entity instanceof org.bukkit.entity.Bee) {
    let slimefunItem = getSfItemById("JP_BEE");
    let item = getItemSafe(slimefunItem.getItem());
    entity.remove();
    let location = entity.getLocation();
    world.dropItemNaturally(location, item);
  }
}

function onUse(event) {
    const player = event.getPlayer();
    if(event.getHand() !== org.bukkit.inventory.EquipmentSlot.HAND){
        player.sendMessage("主手请持增幅书");
        return;
    }
    const invs = player.getInventory();
    
    const itemInMainHand = invs.getItemInMainHand();

    const dustArray = [
        { item: "JP_SMZFS", probability: 0.001 },  //生命增幅书
        { item: "JP_KJRXZFS", probability: 0.001 },//盔甲韧性书
        { item: "JP_HJZFS", probability: 0.005 }, //护甲增幅书
        { item: "JP_SHZFS", probability: 0.005 },  //伤害增幅书
        { item: "JP_QHFMS", probability: 0.002 }, //mmm之力
        { item: "JP_NULL", probability: 0.986 }
    ];

    let totalProbability = dustArray.reduce((total, dust) => total + dust.probability, 0);
    let randomValue = Math.random() * totalProbability;
    let selectedItem = null;
    let cumulativeProbability = 0;

    for (let i = 0; i < dustArray.length; i++) {
        cumulativeProbability += dustArray[i].probability;
        if (randomValue <= cumulativeProbability) {
            selectedItem = dustArray[i].item;
            break;
        }
    }
    if (!selectedItem) {
        selectedItem = dustArray[dustArray.length - 1].item;
    }

    if (itemInMainHand.getAmount() < 1) {
        sendMessage(player, "你的物品数量不足");
        return; 
    }

    itemInMainHand.setAmount(itemInMainHand.getAmount() - 1);
    //invs.setItemInMainHand(itemInMainHand);

    if (selectedItem === "JP_NULL") {
        sendMessage(player, "毛都没获得");
    } else {
        const slimefunItem = getSfItemById(selectedItem);
        const itemstack = getItemSafe(slimefunItem.getItem());
        itemstack.setAmount(1);
        if (invs.firstEmpty() === -1) {
            player.getWorld().dropItemNaturally(player.getLocation(), itemstack);
            sendMessage(player, "背包已满，物品已掉落在地面上");
        } else {
            invs.addItem(itemstack);
            sendMessage(player, "成功获得物品" + itemstack.getItemMeta().getDisplayName() + "*1");
        }
    }
}

function sendMessage(player, message) {
    player.sendMessage(message);
}
