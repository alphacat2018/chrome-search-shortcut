(async () => {
  await storage.init();
  await built_in_config.init();
  search_result_shortcut.init();
  focus_input_shortcut.init();
})();
