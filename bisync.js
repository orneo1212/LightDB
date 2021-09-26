class SyncConflictException extends Error { }

/** Deep Merge objects.
 * First from `objectB` to `objectA` 
 * @param objectA - First object (e.g. Local object)
 * @param objectB - First object (e.g. Remote object)
*/
function merge_objects(objectA, objectB, skip_functions = true) {
  function merge_properties(target, key, value) {
    if (typeof value === "function" && skip_functions) return;
    if (typeof value === "object") {
      if (!target[key]) target[key] = {};
      merge_objects(target[key], value);
      return;
    }
    target[key] = value;
  }
  Object.entries(objectB).forEach(([k, v]) => merge_properties(objectA, k, v));
  Object.entries(objectA).forEach(([k, v]) => merge_properties(objectB, k, v));
}


function _get_timestamp(item) { return item._timestamp || 0; }

function deepEqual(object1, object2) {
  function isObject(object) { return object != null && typeof object === 'object'; }
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (areObjects && !deepEqual(val1, val2) || !areObjects && val1 !== val2) return false;
  }
  return true;
}

function diff_objects(objectA, objectB) {
  var diff = [];
  var newkeys_in_objectA = Object.keys(objectA).filter(x => objectB[x] === undefined);
  Object.entries(objectB).forEach(([k, v]) => {
    // skip objects when are deepEqual 
    if (typeof v === 'object' && typeof objectA[k] === 'object' && deepEqual(v, objectA[k])) return;
    // Is it Add or Change?
    if (objectA[k] !== v) diff.push({ _key: k, _action: objectA[k] === undefined ? 'add' : 'change', value: v });
  });
  newkeys_in_objectA.forEach(key => diff.push({ _key: key, _action: 'remove', value: objectA[key] }));
  return diff;
}

/**
 * Sync objects with the same `_id` by merging data beetween data checking `_timestamp` when present
 * @param {Object} itemA 
 * @param {Object} itemB 
 */
function sync_item(itemA, itemB) {
  if ((itemA._id || itemB._id) && itemA._id != itemB._id) throw new Error("Trying sync objects with different or without `_id`s A:" + itemA._id + " B:" + itemB._id);
  // if itemA is newer replace default sync direction (from itemB to itemA is default)
  if (_get_timestamp(itemA) > _get_timestamp(itemB)) [itemA, itemB] = [itemB, itemA];
  merge_objects(itemA, itemB);
}


/**
 * 
 * @param {Array} local_items with `_id` and optional `_timestamp` keys
 * @param {Array} local_changes 
 * @param {Array} remote_items with `_id`, `_action` from `add|remove|change` and optional `_timestamp`
 * @param {SyncAdapter} sync_adapter 
 */
async function sync(local_adapter, remote_adapter, local_changes) {
  // Apply local changes from last sync
  for (local_change of [...local_changes]) {
    if (!local_change._action) return;
    if (!local_change._id) return;
    if (local_change._action == "add") {
      var item = await local_adapter.get(local_change._id);
      if (item) await remote_adapter.put(item);
    }
    if (local_change._action == "remove") {
      await remote_adapter.del(local_change._id);
    }
    if (local_change._action == "change") {
      var item = await local_adapter.get(local_change._id);
      var remote_item = await remote_adapter.get(local_change._id);
      if (item && remote_item) {
        var diff = diff_objects(item, remote_item);
        if (diff.filter(x => x._action == 'change').length > 0) {
          return false;
        }
        sync_item(item, remote_item);
        await local_adapter.put(item);
        await remote_adapter.put(remote_item);
      }
      // Change but remote don't have item. Just add it
      if (item && !remote_item) {
        await remote_adapter.put(item);
      }
    }
  };

  // Sync from remote
  var remote_items = await remote_adapter.list();
  for (var remote_item of remote_items) {
    if (await local_adapter.has(remote_item._id)) {
      var item = await local_adapter.get(remote_item._id);
      if (item) sync_item(item, await remote_adapter.get(remote_item._id));
    } else await local_adapter.put(await remote_adapter.get(remote_item._id));
  };

  // Reset local changes
  local_changes = [];
  return true;
}

if (module) module.exports = {
  sync, sync_item, diff_objects, merge_objects, SyncConflictException
};