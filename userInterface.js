var blessed = require('blessed');

var keyBindings = {};

module.exports = {
  init: function () {
    var screen = blessed.screen({
      autopadding: true,
      smartCSR: true,
      title: 'Slack',
    });

    var container = blessed.box({
      width: '100%',
      height: '100%',
      style: {
        fg: '#bbb',
        bg: '#1d1f21',
      },
    });

    var sideBar = blessed.box({
      width: '30%',
      height: '100%',
    });

    var mainWindow = blessed.box({
      width: '70%',
      height: '100%',
      left: '30%',
      // scrollable: true,
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: '#888',
        },
      },
    });

    var mainWindowTitle = blessed.text({
      width: '90%',
      tags: true,
    });

    var chatWindow = blessed.box({
      width: '90%',
      height: '75%',
      left: '5%',
      top: '10%',
      keys: true,
      vi: true,
      scrollable: true,
      alwaysScroll: true,
      tags: true,
    });

    var messageInput = blessed.textbox({
      width: '90%',
      left: '5%',
      top: '85%',
      keys: true,
      vi: true,
      inputOnFocus: true,
      border: {
        type: 'line',
      },
    });

    function searchChannels(searchCallback) {
      var searchBoxTitle = blessed.text({
        width: '90%',
        left: '5%',
        align: 'left',
        content: '{bold}Search{/bold}',
        tags: true,
      });
      var searchBox = blessed.textbox({
        width: '90%',
        height: 'shrink',
        left: '5%',
        top: '5%',
        keys: true,
        vi: true,
        inputOnFocus: true,
        border: {
          fg: '#cc6666',
          type: 'line',
        },
      });
      function removeSearchBox() {
        mainWindow.remove(searchBox);
        mainWindow.remove(searchBoxTitle);
        mainWindow.append(mainWindowTitle);
        mainWindow.append(chatWindow);
        mainWindow.append(messageInput);
        screen.render();
      }
      searchBox.on('keypress', function (ch, key) {
        if (Object.keys(keyBindings).includes(key.full)) {
          searchBox.cancel();
          removeSearchBox();
          var fn = keyBindings[key.full];
          if (fn) {
            fn();
          }
        }
      });
      searchBox.on('submit', function (text) {
        removeSearchBox();
        searchCallback(text);
      });
      mainWindow.remove(mainWindowTitle);
      mainWindow.remove(chatWindow);
      mainWindow.remove(messageInput);
      mainWindow.append(searchBoxTitle);
      mainWindow.append(searchBox);
      searchBox.focus();
      screen.render();
    }

    var channelsBox = blessed.box({
      width: '100%',
      height: '40%',
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: '#888',
        },
      },
    });

    var channelsTitle = blessed.text({
      width: '90%',
      left: '5%',
      align: 'center',
      content: '{bold}Channels{/bold}',
      tags: true,
    });

    var channelList = blessed.list({
      width: '90%',
      height: '85%',
      left: '5%',
      top: '10%',
      keys: true,
      vi: true,
      search: searchChannels,
      style: {
        selected: {
          bg: '#373b41',
          fg: '#c5c8c6',
        },
      },
      tags: true,
    });

    var groupsBox = blessed.box({
      width: '100%',
      height: '30%',
      top: '40%',
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: '#888',
        },
      },
    });

    var groupsTitle = blessed.text({
      width: '90%',
      left: '5%',
      align: 'center',
      content: '{bold}Groups{/bold}',
      tags: true,
    });

    var groupList = blessed.list({
      width: '90%',
      height: '85%',
      left: '5%',
      top: '10%',
      keys: true,
      vi: true,
      search: searchChannels,
      style: {
        selected: {
          bg: '#373b41',
          fg: '#c5c8c6',
        },
      },
      tags: true,
    });


    var usersBox = blessed.box({
      width: '100%',
      height: '30%',
      top: '70%',
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: '#888',
        },
      },
    });

    var usersTitle = blessed.text({
      width: '90%',
      left: '5%',
      align: 'center',
      content: '{bold}Users{/bold}',
      tags: true,
    });

    var userList = blessed.list({
      width: '90%',
      height: '70%',
      left: '5%',
      top: '20%',
      keys: true,
      vi: true,
      search: searchChannels,
      style: {
        selected: {
          bg: '#373b41',
          fg: '#c5c8c6',
        },
      },
      tags: true,
    });

    channelsBox.append(channelsTitle);
    channelsBox.append(channelList);
    groupsBox.append(groupsTitle);
    groupsBox.append(groupList);
    usersBox.append(usersTitle);
    usersBox.append(userList);
    sideBar.append(channelsBox);
    sideBar.append(groupsBox);
    sideBar.append(usersBox);
    mainWindow.append(mainWindowTitle);
    mainWindow.append(chatWindow);
    mainWindow.append(messageInput);
    container.append(sideBar);
    container.append(mainWindow);
    screen.append(container);

    keyBindings.escape = process.exit.bind(null, 0);            // esc to exit
    keyBindings['C-c'] = channelList.focus.bind(channelList);   // ctrl-c for channels
    keyBindings['C-g'] = groupList.focus.bind(groupList);       // ctrl-g for channels
    keyBindings['C-u'] = userList.focus.bind(userList);         // ctrl-u for users
    keyBindings['C-w'] = messageInput.focus.bind(messageInput); // ctrl-w for write
    keyBindings['C-l'] = chatWindow.focus.bind(chatWindow);     // ctrl-l for message list

    function callKeyBindings(ch, key) {
      var fn = keyBindings[key.full];
      if (fn) {
        fn();
      }
    }

    userList.on('keypress', callKeyBindings);
    channelList.on('keypress', callKeyBindings);
    groupList.on('keypress', callKeyBindings);
    chatWindow.on('keypress', callKeyBindings);
    messageInput.on('keypress', function (ch, key) {
      if (Object.keys(keyBindings).includes(key.full)) {
        messageInput.cancel();
        callKeyBindings(ch, key);
      }
    });

    // scrolling in chat window
    chatWindow.on('keypress', function (ch, key) {
      if (key.name === 'up') {
        chatWindow.scroll(-1);
        screen.render();
        return;
      }
      if (key.name === 'down') {
        chatWindow.scroll(1);
        screen.render();
        return;
      }
    });

    // event handlers for focus and blur of inputs
    var onFocus = function (component) {
      component.style.border = { fg: '#cc6666' }; // eslint-disable-line no-param-reassign
      screen.render();
    };
    var onBlur = function (component) {
      component.style.border = { fg: '#888' }; // eslint-disable-line no-param-reassign
      screen.render();
    };
    userList.on('focus', onFocus.bind(null, usersBox));
    userList.on('blur', onBlur.bind(null, usersBox));
    channelList.on('focus', onFocus.bind(null, channelsBox));
    channelList.on('blur', onBlur.bind(null, channelsBox));
    groupList.on('focus', onFocus.bind(null, groupsBox));
    groupList.on('blur', onBlur.bind(null, groupsBox));
    messageInput.on('focus', onFocus.bind(null, messageInput));
    messageInput.on('blur', onBlur.bind(null, messageInput));
    chatWindow.on('focus', onFocus.bind(null, mainWindow));
    chatWindow.on('blur', onBlur.bind(null, mainWindow));

    return {
      screen: screen,
      usersBox: usersBox,
      channelsBox: channelsBox,
      usersTitle: usersTitle,
      userList: userList,
      channelsTitle: channelsTitle,
      channelList: channelList,
      groupList: groupList,
      mainWindow: mainWindow,
      mainWindowTitle: mainWindowTitle,
      chatWindow: chatWindow,
      messageInput: messageInput,
    };
  },
};
