// ID棒 - 物品生成器
// 功能：通过输入物品ID和数量来生成物品

// 全局状态变量
let inputMode = "ID"; // 当前输入模式："ID" 或 "QUANTITY"
let isWaitingForInput = false; // 防止重复注册聊天输入

// Java类型导入
let EquipmentSlot = Java.type('org.bukkit.inventory.EquipmentSlot');
let Material = Java.type('org.bukkit.Material');
let ItemStack = Java.type('org.bukkit.inventory.ItemStack');

// 物品掉落（支持数量）
function dropItem(player, input) {
    const world = player.getWorld();
    const location = player.getLocation();
    
    // 解析输入（格式：ID 或 ID:数量）
    const [itemId, amountStr] = input.includes(":") ? input.split(":") : [input, "1"];
    let amount = parseInt(amountStr) || 1;
    amount = Math.max(1, Math.min(amount, 64)); // 限制数量在1-64之间

    // 1. 尝试作为Slimefun物品生成
    const slimefunItem = getSfItemById(itemId.trim());
    if (slimefunItem) {
        const item = slimefunItem.getItem().clone();
        item.setAmount(amount);
        world.dropItemNaturally(location, item);
        player.sendMessage(`§a✅ 成功生成 ${amount} 个 Slimefun物品: §r${itemId}`);
        return;
    }
    
    // 2. 尝试作为原版物品生成
    try {
        const material = Material.valueOf(itemId.trim().toUpperCase());
        if (material && material.isItem()) {
            world.dropItemNaturally(location, new ItemStack(material, amount));
            player.sendMessage(`§a✅ 成功生成 ${amount} 个 原版物品: §r${itemId}`);
            return;
        }
    } catch (e) {
        // 不是有效的原版物品ID，继续执行
    }
    
    // 3. 无效ID
    player.sendMessage(`§c❌ 无效的物品ID: §r${itemId}`);
}

function toggleInputMode(player) {
    if (inputMode === "ID") {
        inputMode = "QUANTITY";
        player.sendMessage("§6🔄 已切换到 §e输入数量模式");
    } else {
        inputMode = "ID";
        player.sendMessage("§6🔄 已切换到 §e输入物品ID模式");
    }
}

function getInputPrompt() {
    return inputMode === "QUANTITY" 
        ? "§a📝 请输入物品数量 (0-64之间的数字):"
        : "§a📝 请输入物品ID (例如: DIAMOND):";
}

function updateItemLore(player, input) {
    const playerItem = player.getInventory().getItemInMainHand();
    const meta = playerItem.getItemMeta();
    const lore = meta.hasLore() ? meta.getLore() : [];
    
    const loreKey = inputMode === "QUANTITY" 
        ? "§4§lShift + 右键输入物品数量 :"
        : "§4§lShift + 右键输入物品ID :";
    
    const newLoreLine = `${loreKey} §2§l${input}`;
    
    // 查找并更新现有Lore，或添加新的Lore
    let found = false;
    for (let i = 0; i < lore.size(); i++) {
        if (lore.get(i).includes(loreKey)) {
            lore.set(i, newLoreLine);
            found = true;
            break;
        }
    }
    
    if (!found) {
        lore.add(newLoreLine);
    }
    
    // 更新物品
    meta.setLore(lore);
    playerItem.setItemMeta(meta);
    player.getInventory().setItemInMainHand(playerItem);
    
    const settingType = inputMode === "QUANTITY" ? "数量" : "物品ID";
    player.sendMessage(`§a✅ 已设置${settingType}: §r${input}`);
}

function readItemData(meta) {
    let itemId = null;
    let amount = 1;
    
    for (const line of meta.getLore()) {
        if (line.includes("§4§lShift + 右键输入物品ID :")) {
            const parts = line.split("§2§l");
            if (parts.length > 1) {
                itemId = parts[1].trim();
            }
        } else if (line.includes("§4§lShift + 右键输入物品数量 :")) {
            const parts = line.split("§2§l");
            if (parts.length > 1) {
                const amountStr = parts[1].trim();
                amount = parseInt(amountStr) || 1;
            }
        }
    }
    
    return { itemId, amount };
}

function onUse(event) {
    const player = event.getPlayer();
    
    // 检查是否使用主手
    if (event.getHand() !== EquipmentSlot.HAND) {
        player.sendMessage("§c❌ 请用主手使用!");
        return;
    }

    const item = event.getItem();
    
    // Shift + 右键：切换输入模式并开始输入
    if (player.isSneaking()) {
        handleSneakClick(player);
    } 
    // 普通右键：生成物品
    else {
        handleNormalClick(player, item);
    }
}

function handleSneakClick(player) {
    // 如果已经在等待输入，提示玩家完成当前输入
    if (isWaitingForInput) {
        player.sendMessage("§c⚠️ 请先完成当前输入或输入 'cancel' 取消");
        return;
    }
    
    // 切换输入模式
    toggleInputMode(player);
    
    // 显示输入提示
    player.sendMessage(getInputPrompt());
    
    // 设置等待输入标志并开始监听
    isWaitingForInput = true;
    
    // 使用Java.extend创建Consumer对象
    let Consumer = Java.type('java.util.function.Consumer');
    let JSConsumer = Java.extend(Consumer, {
        accept: function(input) {
            // 清除等待输入标志
            isWaitingForInput = false;
            
            // 处理取消输入
            if (input.toLowerCase() === "cancel") {
                player.sendMessage("§a✅ 已取消操作");
                return;
            }
            
            // 处理空输入
            if (!input || input.trim() === "") {
                player.sendMessage("§c❌ 输入不能为空，请重新输入");
                return;
            }
            
            // 更新物品Lore
            try {
                updateItemLore(player, input.trim());
            } catch (error) {
                player.sendMessage("§c❌ 设置失败，请重试");
                console.log("Error updating item lore: " + error);
            }
        }
    });
    
    getChatInput(player, new JSConsumer());
}

function handleNormalClick(player, item) {
    const meta = item.getItemMeta();
    if (!meta || !meta.hasLore()) {
        player.sendMessage("§c❌ 未设置物品ID! 请先使用Shift+右键设置");
        return;
    }
    
    // 读取物品数据
    const { itemId, amount } = readItemData(meta);
    
    if (!itemId) {
        player.sendMessage("§c❌ 未设置物品ID! 请先使用Shift+右键设置");
        return;
    }
    
    // 组合物品ID和数量并生成
    const input = amount > 1 ? `${itemId}:${amount}` : itemId;
    dropItem(player, input);
}