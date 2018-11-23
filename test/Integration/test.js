var assert = require('assert');
var Client = require('../../');
var cl = new Client('u193485-e7bb953d295bd66420f2f5d6'); // Original Client
describe('Integration testing', function() {
  
  describe('getmonitors tests', function() {

    it('getmonitors should return an error is an invalid API key is passed',  function(done) {
      var cl = new Client('invalid'); 
      cl.getMonitors({customUptimeRatio: [1, 7, 30]},null) 
      .then(() => {
        done(new Error('Expected method to reject.'))
      })
      .catch((err) => {
        assert(err);
        done();
      })
      .catch(done);
   }); 

    it('getmonitors should return 1 monitor',  async function() {
      const res =  await cl.getMonitors({customUptimeRatio: [1, 7, 30]},null) 
      assert.equal(1,res.length)
    }); 

    it('getmonitors should return a promise',  async function() {
      const res =  cl.getMonitors({customUptimeRatio: [1, 7, 30]},null) 
      var isPromise = typeof res.then == 'function'
      assert(isPromise )
    }); 

    it('getmonitors should return a monitor called \'example\'',  async function() {
      var cl = new Client('u193485-e7bb953d295bd66420f2f5d6'); 
      const res =  await cl.getMonitors({customUptimeRatio: [1, 7, 30]},null) 
      assert.equal('example',res[0].friendly_name)
    }); 

    it('getmonitors should return a monitor monitoring \'example.com\'',  async function() {
      var cl = new Client('u193485-e7bb953d295bd66420f2f5d6'); // Original Client
      const res =  await cl.getMonitors({customUptimeRatio: [1, 7, 30]},null) 
      assert.equal('http://example.com',res[0].url)
    }); 
  });

  describe('resetMonitor tests', function() {

    it('resetMonitor should return an error is an invalid API key is passed',  function(done) {
      var cl = new Client('invalid'); // Original Client

      cl.resetMonitor('776540955') 
      .then(() => {
        done(new Error('Expected method to reject.'))
      })
      .catch((err) => {
        assert(err);
        done();
      })
      .catch(done);
   }); 

   it('resetMonitor should return ok when resetting a monitor',  async function() {
    const result = await cl.resetMonitor('776540955')
    assert.equal(result.stat,'ok')
  }); 
  });

  describe('getAccountDetails tests', function() {
    it('getAccountDetails should return an error is an invalid API key is passed',  function(done) {
      var cl = new Client('invalid'); // Original Client

      cl.getAccountDetails('776540955') 
      .then(() => {
        done(new Error('Expected method to reject.'))
      })
      .catch((err) => {
        assert(err);
        done();
      })
      .catch(done);
   }); 

   it('getAccountDetails should return ok when getting account details',  async function() {
    const result = await cl.getAccountDetails()
    assert.equal(result.stat,'ok')
    }); 

    it('getAccountDetails should return an email of cabbie@jepso.com when getting account details',  async function() {
      const result = await cl.getAccountDetails()
      assert.equal(result.account.email,'cabbie@jepso.com')
      }); 

    it('getAccountDetails should return a monitor_limit of 50 when getting account details',  async function() {
      const result = await cl.getAccountDetails()
      assert.equal(result.account.monitor_limit,50)
    }); 

    it('getAccountDetails should return a monitor_interval of 5 when getting account details',  async function() {
      const result = await cl.getAccountDetails()
      assert.equal(result.account.monitor_interval,5)
    }); 

    it('getAccountDetails should show a single monitor when getting account details',  async function() {
      const result = await cl.getAccountDetails()
      const monitors = result.account.up_monitors + result.account.down_monitors + result.account.paused_monitors 
      assert.equal(monitors,1)
    }); 
  });

  describe('getAlertContacts tests', function() {
    it('getAlertContacts should return an error is an invalid API key is passed',  function(done) {
      var cl = new Client('invalid');
      cl.getAccountDetails('776540955') 
      .then(() => {
        done(new Error('Expected method to reject.'))
      })
      .catch((err) => {
        assert(err);
        done();
      })
      .catch(done);
    }); 

    it('getAlertContacts should return ok when getting account details',  async function() {
     const result = await cl.getAlertContacts()
     assert.equal(result.stat,'ok')
    }); 

    it('getAlertContacts should return correct details when getting account details',  async function() {
      const result = await cl.getAlertContacts()
      const cabbie = result.alert_contacts.filter(function(contact){return contact.value === 'cabbie@jepso.com'})
      assert.equal(cabbie.length,1,'Alert Contacts should contain 1 entry.')
      assert.equal(cabbie[0].value,'cabbie@jepso.com','Alert Contacts should contain cabbie@jepso.com')
      const cabbiedirect = await cl.getAlertContacts([{alert_contacts:cabbie[0].id}])
      assert.equal(cabbiedirect.alert_contacts.length,1,'obtaining Alert Contact by ID should return a single Alert Contact.')
      assert.equal(cabbiedirect.alert_contacts[0].value,'cabbie@jepso.com','Alert Contacts should contain cabbie@jepso.com')
    }); 

    it('getAllAlertContactIds should return all contact ids',  async function() {
      const result = await cl.getAllAlertContactIds()
      assert.equal(result.length,1,'Alert Contacts should contain 1 entry.')
      assert.equal(result[0],'0193485','Alert Contacts should contain 0193485.')
    })      
  });

  describe('Adding, creating and Deleting monitor tests', function() {
    it('getAlertContacts should return an error is an invalid API key is passed',  function(done) {
      var cl = new Client('invalid');
      cl.getAccountDetails('776540955')
      .then(() => {
        done(new Error('Expected method to reject.'))
      })
      .catch((err) => {
        assert(err);
        done();
      })
      .catch(done);
    }); 

   it('Can add, edit and delete a monitor',  async function() {
    this.timeout(0);
    const res =  await cl.getMonitors() 
    const newMonitor = await cl.newMonitor({friendly_name:'TEST_MONITOR_', url:'http://www.google.com', })
    assert.equal('ok',newMonitor.stat)

    // Confirm that the new list of monitors contains the new monitor
    const updatedMonitorList =  await cl.getMonitors() 
    const inList = updatedMonitorList.filter(function(monitor){return monitor.friendly_name === 'TEST_MONITOR_'})
    assert.equal(inList.length,1,' list of all monitors should include this new monitor')

    // Confirm that this monitor can be selected by it's id
    const specificMonitor =  await cl.getMonitors({monitors:[newMonitor.monitor.id]}) 
    assert.equal(specificMonitor.length,1,'Specific monitor should include this new monitor')

    // Confirm that a monitor can be edited
    const editMonitor =  await cl.editMonitor({id:newMonitor.monitor.id, friendly_name:'TEST_MONITOR_UPDATED' }) 
    assert.equal(editMonitor.stat,'ok','Editing a Monitor should return OK')
    const specificMonitorUpdated =  await cl.getMonitors({monitors:[newMonitor.monitor.id]}) 
    assert.equal(specificMonitorUpdated.length,1,'Confirming that a monitor has been updated should return just this 1 monitor')
    assert.equal(specificMonitorUpdated[0].friendly_name,'TEST_MONITOR_UPDATED','New Monitor should be called TEST_MONITOR_UPDATED')

    // Confirm that a monitor can be deleted
    const deleteMonitor =  await cl.deleteMonitor(newMonitor.monitor.id) 
    assert.equal(deleteMonitor.stat,'ok','Deleting a monitor should return OK')

    //confirm deletion
    const ConfirmNoMonitor =  await cl.getMonitors({monitors:[newMonitor.monitor.id]}) 
    assert.equal(ConfirmNoMonitor.length,0,'Monitor is deleted -  should return empty array.')
    this.timeout(2000);
    }); 
  });
});

