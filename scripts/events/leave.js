const { getTime, drive } = global.utils;

module.exports = {
  config: {
    name: "leave",
    version: "1.4",
    author: "Dan jersey",
    category: "events"
  },

  langs: {
    vi: {
      session1: "sáng",
      session2: "trưa",
      session3: "chiều",
      session4: "tối",
      leaveType1: "tự rời",
      leaveType2: "bị kick",
      defaultLeaveMessage: "{userName} đã {type} khỏi nhóm"
    },
    en: {
      session1: "matin",
      session2: "midi",
      session3: "après-midi",
      session4: "soir",
      leaveType1: "a quitté",
      leaveType2: "a été expulsé de",
      defaultLeaveMessage: "{userName} a quitté le groupe, j'avais même pas remarqué qu'il/elle était là."
    }
  },

  onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
    if (event.logMessageType == "log:unsubscribe")
      return async function () {
        const { threadID } = event;
        const threadData = await threadsData.get(threadID);
        if (!threadData.settings.sendLeaveMessage)
          return;
        const { leftParticipantFbId } = event.logMessageData;
        if (leftParticipantFbId == api.getCurrentUserID())
          return;
        const hours = getTime("HH");

        const threadName = threadData.threadName;
        const userName = await usersData.getName(leftParticipantFbId);

        let { leaveMessage = "{userName} a quitté le groupe, j'avais même pas remarqué qu'il/elle était là." } = threadData.data;
        const form = {
          mentions: leaveMessage.match(/\{userNameTag\}/g) ? [{
            tag: userName,
            id: leftParticipantFbId
          }] : null
        };

        leaveMessage = leaveMessage
          .replace(/\{userName\}|\{userNameTag\}/g, userName)
          .replace(/\{type\}/g, leftParticipantFbId == event.author ? "a quitté" : "a été expulsé de")
          .replace(/\{threadName\}|\{boxName\}/g, threadName)
          .replace(/\{time\}/g, hours)
          .replace(/\{session\}/g, hours <= 10 ?
            "matin" :
            hours <= 12 ?
              "midi" :
              hours <= 18 ?
                "après-midi" :
                "soir"
          );

        form.body = leaveMessage;

        if (leaveMessage.includes("{userNameTag}")) {
          form.mentions = [{
            id: leftParticipantFbId,
            tag: userName
          }];
        }

        if (threadData.data.leaveAttachment) {
          const files = threadData.data.leaveAttachment;
          const attachments = files.reduce((acc, file) => {
            acc.push(drive.getFile(file, "stream"));
            return acc;
          }, []);
          form.attachment = (await Promise.allSettled(attachments))
            .filter(({ status }) => status == "fulfilled")
            .map(({ value }) => value);
        }
        message.send(form);
      };
  }
};
