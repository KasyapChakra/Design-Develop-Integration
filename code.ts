


// This file holds the main code for the plugin. It has access to the *document*.
// You can access browser APIs such as the network by creating a UI which contains
// a full browser environment (see documentation).

// Runs this code if the plugin is run in Figma
if (figma.editorType === 'figma') {
  // This plugin will open a window to prompt the user to enter a number, and
  // it will then create that many rectangles on the screen.

  // This shows the HTML page in "ui.html".
  figma.showUI(__html__);
  figma.ui.postMessage({ type: 'here'});


  // get the stored auth values, if any, and pass them to the UI
  var username = ""
  var APIKey = ""
  var listID = ""
  var figmaAPIKey = ""

  figma.clientStorage.getAsync("DesignDevelop-FigmaAPIKey").then((figmaAPIKeyC) => {
    if (figmaAPIKeyC) {
      figmaAPIKey = figmaAPIKeyC;
    }

  figma.clientStorage.getAsync("DesignDevelop-Username").then((usernameC) => {
    if (usernameC) {
      username = usernameC;
    }
    figma.clientStorage.getAsync("DesignDevelop-APIKey").then((APIKeyC) => {
      if (APIKeyC) {
        APIKey = APIKeyC;
      }
      figma.clientStorage.getAsync("DesignDevelop-ListID").then((listIDC) => {
        if (listIDC) {
          listID = listIDC;
        }
        figma.ui.postMessage({ username: username, 
          APIKey: APIKey, 
          listID: listID, 
          figmaAPIKey: figmaAPIKey,
          type: 'getAuthValues'});
      });
    });
  });
});

  


// get all of the stored status labels

var existingTaskIDs = []
figma.clientStorage.getAsync("DesignDevelop-TaskIDs").then((existingTaskIDsC) => {
  if (existingTaskIDsC) {
    existingTaskIDs = existingTaskIDsC;
  }
})


// setInterval(function() {
//   for (var taskID in existingTaskIDs) {
//     figma.ui.postMessage({ type: 'get_updated_ticket_info', task_id: taskID});
//   }
// }, 2 * 1000); 



  // Calls to "parent.postMessage" from within the HTML page will trigger this
  // callback. The callback will be passed the "pluginMessage" property of the
  // posted message.
  figma.ui.onmessage = msg => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    console.log("hfbdfikbfu" + msg.type)
    if (msg.type === 'create-task-from-existing') {
      console.log("GOT TO EHREb")
      // don't run if they haven't selected anything
      if (figma.currentPage.selection.length > 0) {
        console.log("X " + figma.currentPage.selection[0].x);
          console.log("Y " + figma.currentPage.selection[0].y);

      // save the login info
      console.log("SAVED USERNAME AS " + msg.userName);
      console.log("SAVED APIKey AS " + msg.apiKey);
      console.log("SAVED FIGMA APIKey AS " + msg.figmaApiKey);
      console.log("SAVED ListIDa AS " + msg.listID);
      figma.clientStorage.setAsync("DesignDevelop-Username", msg.userName);
      figma.clientStorage.setAsync("DesignDevelop-APIKey", msg.apiKey);
      figma.clientStorage.setAsync("DesignDevelop-FigmaAPIKey", msg.figmaApiKey);
      figma.clientStorage.setAsync("DesignDevelop-ListID", msg.listID);

      // get the heighest, lowest y and the heighest, lowest x among the components 
      // these are the dimensions of the eventual box around it

      let newNodeFirst = figma.currentPage.selection[0].absoluteTransform;
      let xFirst = newNodeFirst[0][2];
      let yFirst = newNodeFirst[1][2];
      var minX = xFirst
      var minY = yFirst

      var maxX = xFirst + figma.currentPage.selection[0].width;
      var maxY = yFirst + figma.currentPage.selection[0].height;


      figma.currentPage.selection.forEach(element => {
        let newNode = element.absoluteTransform;
        let x = newNode[0][2];
        let y = newNode[1][2];
        if (x <= minX) {
          minX = x;
          
        }
        if (y <= minY) {
          minY = y;
          
        }
        if (x + element.width >= maxX) {
          maxX = x + element.width;
          
        }
        if (y + element.height >= maxY) {
          maxY = y + element.height
          
        }
      }) 




     

      // create task in Clickup
      //figma.ui.postMessage({ type: 'post-info-Clickup'});

      // this is the one the link and image will use, so make it parent of all in current selection and make it at the top.
      
      const parentRect = figma.createComponent();

      figma.group(figma.currentPage.selection, parentRect);

      figma.currentPage.insertChild(figma.currentPage.children.length, parentRect);

      


      const ticketRect = figma.createComponent();

      ticketRect.visible = true;
      ticketRect.resize(Math.max((maxX - minX)/2, 900), Math.max((maxY - minY)/10, 200));
      ticketRect.x = figma.currentPage.selection[0].x - (ticketRect.width / 2);
      ticketRect.y = figma.currentPage.selection[0].y - (ticketRect.height / 2) - 100;
      
      if (msg.isDraft) {
       ticketRect.fills = [{type: 'SOLID', color: {r: 0.5, g: 0.5, b: 0.5}}];
      } else {
        ticketRect.fills = [{type: 'SOLID', color: {r: 221/255, g: 160/255, b: 221/255}}];
      }
      
      ticketRect.name = msg.taskName


    
      
      figma.loadFontAsync({ family: "Inter", style: "Regular" }).then(() => {
          var today = new Date();
          var dd = String(today.getDate());
          var mm = String(today.getMonth() + 1)
          var yyyy = today.getFullYear();

          const nameText = figma.createText();
          nameText.characters = "Task: " + msg.taskName + " [Link Here]" + '\n' + mm + '/' + dd + '/' + yyyy + '\n';




          nameText.textAlignVertical = "CENTER"
          nameText.textAlignHorizontal = "CENTER"
          nameText.fontSize = ticketRect.height/5;
          nameText.hyperlink = {type: "URL", value: msg.taskLink};
          nameText.textDecoration = "UNDERLINE";


          const statusText = figma.createText();
          statusText.characters = "Status: Ticket Published. Do not modify design.";
          statusText.name = msg.newTaskID;


          //task status levels are: Ticket Published, Assigned, Completed.


          statusText.textAlignVertical = "CENTER"
          statusText.textAlignHorizontal = "CENTER"
          statusText.fontSize = ticketRect.height/5;

          
        


          

          ticketRect.x = xFirst;
          ticketRect.y = yFirst - 200;

          ticketRect.appendChild(nameText);
          nameText.x = ticketRect.width/2 - nameText.width/2;
          nameText.y = ticketRect.height/2 - nameText.height/3;

          ticketRect.appendChild(statusText);
          statusText.x = ticketRect.width/2 - statusText.width/2;
          statusText.y = ticketRect.height/2 - nameText.height/1.5;

          existingTaskIDs.push(msg.newTaskID);
          
          figma.clientStorage.setAsync("DesignDevelop-TaskIDs", existingTaskIDs);


          console.log("RECT X " + ticketRect.x);
          console.log("RECT Y " + ticketRect.y);


          
          
          figma.currentPage.appendChild(ticketRect);
          const nodes: SceneNode[] = [];
          nodes.push(ticketRect)
          figma.currentPage.selection = nodes;
          //figma.viewport.scrollAndZoomIntoView(nodes);

         
          // make the box around the components, add some padding
          // not always grey
           const bigGreyBox = figma.createComponent();
           bigGreyBox.visible = false // true;
           bigGreyBox.resize(maxX - minX + 100, maxY - minY + 100);
           bigGreyBox.x = minX - 50;
           bigGreyBox.y = minY - 50;

           const leftBorder = figma.createComponent();
           leftBorder.visible = true;
           leftBorder.resize(20, maxY - minY + 100);
           leftBorder.x = minX - 50;
           leftBorder.y = minY - 50;

           const rightBorder = figma.createComponent();
           rightBorder.visible = true;
           rightBorder.resize(20, maxY - minY + 100);
           rightBorder.x = maxX + 50;
           rightBorder.y = minY - 50;

           const topBorder = figma.createComponent();
           topBorder.visible = true;
           topBorder.resize(maxX - minX + 100, 20);
           topBorder.x = minX - 50;
           topBorder.y = minY - 50;

           const bottomBorder = figma.createComponent();
           bottomBorder.visible = true;
           bottomBorder.resize(maxX - minX + 120, 20);
           bottomBorder.x = minX - 50;
           bottomBorder.y = maxY + 50;
           
           if (msg.isDraft) {
            bigGreyBox.fills = [{type: 'SOLID', color: {r: 0.5, g: 0.5, b: 0.5}, opacity: 0.3}];
            leftBorder.fills = [{type: 'SOLID', color: {r: 0.5, g: 0.5, b: 0.5}, opacity: 0.3}];
            rightBorder.fills = [{type: 'SOLID', color: {r: 0.5, g: 0.5, b: 0.5}, opacity: 0.3}];
            topBorder.fills = [{type: 'SOLID', color: {r: 0.5, g: 0.5, b: 0.5}, opacity: 0.3}];
            bottomBorder.fills = [{type: 'SOLID', color: {r: 0.5, g: 0.5, b: 0.5}, opacity: 0.3}];
           } else {
           bigGreyBox.fills = [{type: 'SOLID', color: {r: 221/255, g: 160/255, b: 221/255}, opacity: 0.5}];
           leftBorder.fills = [{type: 'SOLID', color: {r: 221/255, g: 160/255, b: 221/255}, opacity: 0.5}];
           rightBorder.fills = [{type: 'SOLID', color: {r: 221/255, g: 160/255, b: 221/255}, opacity: 0.5}];
           topBorder.fills = [{type: 'SOLID', color: {r: 221/255, g: 160/255, b: 221/255}, opacity: 0.5}];
           bottomBorder.fills = [{type: 'SOLID', color: {r: 221/255, g: 160/255, b: 221/255}, opacity: 0.5}];
           }
           const warningText = figma.createText();
          
          //  if (msg.isDraft) {
          //   warningText.characters = "DRAFT VERSION";
          //  } else {
          //  warningText.characters = "PUBLISHED AT THIS LINK, DO NOT EDIT.";
          //  }
           
           warningText.hyperlink = {type: "URL", value: msg.taskLink};
           warningText.textDecoration = "UNDERLINE";
           warningText.opacity = 0.6;

          warningText.fontSize = bigGreyBox.height/10;
          warningText.x = bigGreyBox.x + bigGreyBox.width/2 - warningText.width/2;
          warningText.y = bigGreyBox.y + bigGreyBox.height/2;
          
           


          figma.currentPage.insertChild(figma.currentPage.children.length, warningText);
          figma.currentPage.insertChild(0, bigGreyBox);
          figma.currentPage.insertChild(0, leftBorder);
          figma.currentPage.insertChild(0, rightBorder);
          figma.currentPage.insertChild(0, topBorder);
          figma.currentPage.insertChild(0, bottomBorder);
          //bigGreyBox.appendChild(warningText);

          ticketRect.x = bigGreyBox.x + bigGreyBox.width/4;
          ticketRect.y = bigGreyBox.y - 230;

          // add all the selection to children of big grey, so the image is really easy to get.

          

          
          // add notification saying it was posted

          figma.notify("Ticket Fetched!")

          // tell the UI to fetch the image and update the ticket accordingly



        //figma.ui.postMessage({ type: 'post-image-to-task', node_id: parentRect.id, link_node_id: ticketRect.id /*warningText.id*/, file_key: figma.fileKey, file_name: figma.root.name});
          


          
      });
      
      } else {
        // Ask user to select something
        console.log("NOTHING SELECTED")
      } 
    }
    if (msg.type === 'create-task') {
      
      // don't run if they haven't selected anything
      if (figma.currentPage.selection.length > 0) {
      
        console.log("X " + figma.currentPage.selection[0].x);
          console.log("Y " + figma.currentPage.selection[0].y);

      // save the login info
      console.log("SAVED USERNAME AS " + msg.userName);
      console.log("SAVED APIKey AS " + msg.apiKey);
      console.log("SAVED FIGMA APIKey AS " + msg.figmaApiKey);
      console.log("SAVED ListIDb AS " + msg.listID);
      figma.clientStorage.setAsync("DesignDevelop-Username", msg.userName);
      figma.clientStorage.setAsync("DesignDevelop-APIKey", msg.apiKey);
      figma.clientStorage.setAsync("DesignDevelop-FigmaAPIKey", msg.figmaApiKey);
      figma.clientStorage.setAsync("DesignDevelop-ListID", msg.listID);

      // get the heighest, lowest y and the heighest, lowest x among the components 
      // these are the dimensions of the eventual box around it

      let newNodeFirst = figma.currentPage.selection[0].absoluteTransform;
      let xFirst = newNodeFirst[0][2];
      let yFirst = newNodeFirst[1][2];
      var minX = xFirst
      var minY = yFirst

      var maxX = xFirst + figma.currentPage.selection[0].width;
      var maxY = yFirst + figma.currentPage.selection[0].height;


      figma.currentPage.selection.forEach(element => {
        let newNode = element.absoluteTransform;
        let x = newNode[0][2];
        let y = newNode[1][2];
        if (x <= minX) {
          minX = x;
          
        }
        if (y <= minY) {
          minY = y;
          
        }
        if (x + element.width >= maxX) {
          maxX = x + element.width;
          
        }
        if (y + element.height >= maxY) {
          maxY = y + element.height
          
        }
      }) 




     

      // create task in Clickup
      figma.ui.postMessage({ type: 'post-info-Clickup'});

      // this is the one the link and image will use, so make it parent of all in current selection and make it at the top.
      
      const parentRect = figma.createComponent();

      figma.group(figma.currentPage.selection, parentRect);

      figma.currentPage.insertChild(figma.currentPage.children.length, parentRect);

      


      const ticketRect = figma.createComponent();

      ticketRect.visible = true;
      ticketRect.resize(Math.max((maxX - minX)/2, 900), Math.max((maxY - minY)/10, 200));
      ticketRect.x = figma.currentPage.selection[0].x - (ticketRect.width / 2);
      ticketRect.y = figma.currentPage.selection[0].y - (ticketRect.height / 2) - 100;
      
      if (msg.isDraft) {
       ticketRect.fills = [{type: 'SOLID', color: {r: 0.5, g: 0.5, b: 0.5}}];
      } else {
        ticketRect.fills = [{type: 'SOLID', color: {r: 221/255, g: 160/255, b: 221/255}}];
      }
      
      ticketRect.name = msg.taskName


    
      
      figma.loadFontAsync({ family: "Inter", style: "Regular" }).then(() => {
          var today = new Date();
          var dd = String(today.getDate());
          var mm = String(today.getMonth() + 1)
          var yyyy = today.getFullYear();

          const nameText = figma.createText();
          nameText.characters = "Task: " + msg.taskName + " [Link Here]" + '\n' + mm + '/' + dd + '/' + yyyy + '\n';




          nameText.textAlignVertical = "CENTER"
          nameText.textAlignHorizontal = "CENTER"
          nameText.fontSize = ticketRect.height/5;
          nameText.hyperlink = {type: "URL", value: msg.taskLink};
          nameText.textDecoration = "UNDERLINE";


          const statusText = figma.createText();
          statusText.characters = "Status: Ticket Published. Do not modify design.";
          statusText.name = msg.newTaskID;


          //task status levels are: Ticket Published, Assigned, Completed.


          statusText.textAlignVertical = "CENTER"
          statusText.textAlignHorizontal = "CENTER"
          statusText.fontSize = ticketRect.height/5;

          
        


          

          ticketRect.x = xFirst;
          ticketRect.y = yFirst - 200;

          ticketRect.appendChild(nameText);
          nameText.x = ticketRect.width/2 - nameText.width/2;
          nameText.y = ticketRect.height/2 - nameText.height/3;

          ticketRect.appendChild(statusText);
          statusText.x = ticketRect.width/2 - statusText.width/2;
          statusText.y = ticketRect.height/2 - nameText.height/1.5;

          existingTaskIDs.push(msg.newTaskID);
          
          figma.clientStorage.setAsync("DesignDevelop-TaskIDs", existingTaskIDs);


          console.log("RECT X " + ticketRect.x);
          console.log("RECT Y " + ticketRect.y);


          
          
          figma.currentPage.appendChild(ticketRect);
          const nodes: SceneNode[] = [];
          nodes.push(ticketRect)
          figma.currentPage.selection = nodes;
          //figma.viewport.scrollAndZoomIntoView(nodes);

         
          // make the box around the components, add some padding
          // not always grey
           const bigGreyBox = figma.createComponent();
           bigGreyBox.visible = false // true;
           bigGreyBox.resize(maxX - minX + 100, maxY - minY + 100);
           bigGreyBox.x = minX - 50;
           bigGreyBox.y = minY - 50;

           const leftBorder = figma.createComponent();
           leftBorder.visible = true;
           leftBorder.resize(20, maxY - minY + 100);
           leftBorder.x = minX - 50;
           leftBorder.y = minY - 50;

           const rightBorder = figma.createComponent();
           rightBorder.visible = true;
           rightBorder.resize(20, maxY - minY + 100);
           rightBorder.x = maxX + 50;
           rightBorder.y = minY - 50;

           const topBorder = figma.createComponent();
           topBorder.visible = true;
           topBorder.resize(maxX - minX + 100, 20);
           topBorder.x = minX - 50;
           topBorder.y = minY - 50;

           const bottomBorder = figma.createComponent();
           bottomBorder.visible = true;
           bottomBorder.resize(maxX - minX + 120, 20);
           bottomBorder.x = minX - 50;
           bottomBorder.y = maxY + 50;
           
           if (msg.isDraft) {
            bigGreyBox.fills = [{type: 'SOLID', color: {r: 0.5, g: 0.5, b: 0.5}, opacity: 0.3}];
            leftBorder.fills = [{type: 'SOLID', color: {r: 0.5, g: 0.5, b: 0.5}, opacity: 0.3}];
            rightBorder.fills = [{type: 'SOLID', color: {r: 0.5, g: 0.5, b: 0.5}, opacity: 0.3}];
            topBorder.fills = [{type: 'SOLID', color: {r: 0.5, g: 0.5, b: 0.5}, opacity: 0.3}];
            bottomBorder.fills = [{type: 'SOLID', color: {r: 0.5, g: 0.5, b: 0.5}, opacity: 0.3}];
           } else {
           bigGreyBox.fills = [{type: 'SOLID', color: {r: 221/255, g: 160/255, b: 221/255}, opacity: 0.5}];
           leftBorder.fills = [{type: 'SOLID', color: {r: 221/255, g: 160/255, b: 221/255}, opacity: 0.5}];
           rightBorder.fills = [{type: 'SOLID', color: {r: 221/255, g: 160/255, b: 221/255}, opacity: 0.5}];
           topBorder.fills = [{type: 'SOLID', color: {r: 221/255, g: 160/255, b: 221/255}, opacity: 0.5}];
           bottomBorder.fills = [{type: 'SOLID', color: {r: 221/255, g: 160/255, b: 221/255}, opacity: 0.5}];
           }
           const warningText = figma.createText();
          
          //  if (msg.isDraft) {
          //   warningText.characters = "DRAFT VERSION";
          //  } else {
          //  warningText.characters = "PUBLISHED AT THIS LINK, DO NOT EDIT.";
          //  }
           
           warningText.hyperlink = {type: "URL", value: msg.taskLink};
           warningText.textDecoration = "UNDERLINE";
           warningText.opacity = 0.6;

          warningText.fontSize = bigGreyBox.height/10;
          warningText.x = bigGreyBox.x + bigGreyBox.width/2 - warningText.width/2;
          warningText.y = bigGreyBox.y + bigGreyBox.height/2;
          
           


          figma.currentPage.insertChild(figma.currentPage.children.length, warningText);
          figma.currentPage.insertChild(0, bigGreyBox);
          figma.currentPage.insertChild(0, leftBorder);
          figma.currentPage.insertChild(0, rightBorder);
          figma.currentPage.insertChild(0, topBorder);
          figma.currentPage.insertChild(0, bottomBorder);
          //bigGreyBox.appendChild(warningText);

          ticketRect.x = bigGreyBox.x + bigGreyBox.width/4;
          ticketRect.y = bigGreyBox.y - 230;

          // add all the selection to children of big grey, so the image is really easy to get.

          

          
          // add notification saying it was posted

          figma.notify("Ticket Posted!")

          // tell the UI to fetch the image and update the ticket accordingly



        figma.ui.postMessage({ type: 'post-image-to-task', node_id: parentRect.id, link_node_id: ticketRect.id /*warningText.id*/, file_key: figma.fileKey, file_name: figma.root.name});
          


          
      });
      
      } else {
        // Ask user to select something
        console.log("NOTHING SELECTED")
      } 

    }

    if (msg.type === 'update-task-of-ID') {
      const currLabel = figma.currentPage.findAll(n => n.name === msg.task_ID)[0];
      if (msg.status != undefined) {
        //currLabel.characters = msg.status;
      }
    }

    if (msg.type === 'image-post-failed') {

      figma.notify("Image failed to post. Please check your Figma API token.")
    }

    if (msg.type === 'post-failed') {

      figma.notify("Failed to post. Please check your authentication info.")
    }

    if (msg.type === 'close-plugin') {

      figma.closePlugin();
    }
  };
}