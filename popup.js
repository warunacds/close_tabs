document.addEventListener('DOMContentLoaded', function () {
	
    const domainsToClose = [
		'youtube.com', 
		'google.com', 
		'facebook.com', 
		'twitter.com', 
		'instagram.com', 
		'linkedin.com', 
		'formula1.com'
	];	
	
  //list domains that will be closed.
	function updateList() {		
  		chrome.tabs.query({}, function (tabs) {
			//uncomment if you want to show list of tabs that will closed
    	  // let tabList = document.getElementById('tabList');
		  // tabList.innerHTML = '';  // Clear the current list
		  let count = document.getElementById('count');
		  count.innerHTML = 'No unnecessary tabs to close.'
	
		  var removeCount = 0;
    	  tabs.forEach(function (tab) {
			  const url = new URL(tab.url);
		
			  chrome.storage.local.get('customDomains', function (result) {
			
				  const customDomainsToClose = result.customDomains || [];
				  const allDomainsToClose = customDomainsToClose.concat(domainsToClose);
				  
				  if (allDomainsToClose.some(domain => url.hostname.includes(domain))) {
					  //uncomment if you want to show list of tabs that will closed
	        		  // let listItem = document.createElement('li');
	        		  // listItem.textContent = tab.title;
	        		  // tabList.appendChild(listItem);
					  removeCount++;
					  count.innerHTML = "Closing "+removeCount+ (removeCount === 1? " tab":" tabs");
				  }
			  });	
      
    	  });
  });
  
}

updateList();
  
  function closeTabs(domains) {
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
          const url = new URL(tab.url);
          if (domains.some(domain => url.hostname.includes(domain))) {
            chrome.tabs.remove(tab.id);
          }
        });
      });
   }
	
  function updateCustomDomainList() {
      chrome.storage.local.get('customDomains', function (result) {
        const customDomains = result.customDomains || [];
        const customDomainList = document.getElementById('customDomainList');
        customDomainList.innerHTML = '';

        customDomains.forEach((domain, index) => {
          const listItem = document.createElement('li');
		  // listItem.textContent = domain;
		  listItem.style.display = 'flex';  
		  listItem.justifyContent = 'space-between';
		  listItem.style.alignItems = 'center';  
		  
		  const pElement = document.createElement('p');
		  pElement.textContent = domain;
		  listItem.appendChild(pElement);

          const removeButton = document.createElement('button');
		  removeButton.innerHTML = '<i class="fas fa-trash"></i>';
		  removeButton.style.marginLeft = '10px';
		  
		  removeButton.classList.add('remove-button');
          removeButton.addEventListener('click', function () {
            removeCustomDomain(index);
          });

          listItem.appendChild(removeButton);
          customDomainList.appendChild(listItem);
        });
      });
    }

    // Function to remove a custom domain from storage
    function removeCustomDomain(index) {
      chrome.storage.local.get('customDomains', function (result) {
        let customDomains = result.customDomains || [];
        customDomains.splice(index, 1);  // Remove the domain at the specified index
        chrome.storage.local.set({ customDomains: customDomains }, function () {
          updateCustomDomainList();  // Update the displayed list after removal
		  updateList();
        });
      });
    }

    // Load the stored custom domains and display them when the popup loads
    updateCustomDomainList();
	
    document.getElementById('addCustomDomainButton').addEventListener('click', function () {
       const customDomain = document.getElementById('customDomainInput').value.trim();
       if (customDomain) {
         chrome.storage.local.get('customDomains', function (result) {
           const customDomains = result.customDomains || [];
           if (!customDomains.includes(customDomain)) {  // Avoid duplicates
             customDomains.push(customDomain);
             chrome.storage.local.set({ customDomains: customDomains }, function () {
               updateCustomDomainList(); 
               document.getElementById('customDomainInput').value = '';
			   updateList();
             });
           } else {
             alert('This domain is already in the list.');
           }
         });
       } else {
         alert('Please enter a valid domain name.');
       }
     });
  
  document.getElementById('closeTabsButton').addEventListener('click', function () {
	  
	  chrome.storage.local.get('customDomains', function (result) {
	        const customDomains = result.customDomains || [];
	        closeTabs(customDomains);
	      });
		  
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        // Check if the tab's URL matches any of the domains
        const url = new URL(tab.url);
        if (domainsToClose.some(domain => url.hostname.includes(domain))) {
          chrome.tabs.remove(tab.id);
        }
      });
    });
  });
  

  
});
