
//{namespace name=backend/plugin_manager/translation}
Ext.define('Shopware.apps.PluginManager.view.components.StorePlugin', {
    extend: 'Ext.container.Container',

    alternateClassName: 'PluginManager.components.StorePlugin',

    cls: 'store-plugin',

    alias: 'widget.plugin-manager-store-plugin',

    mixins: {
        events: 'Shopware.apps.PluginManager.view.PluginHelper'
    },

    initComponent: function() {
        var me = this, event;

        me.on('afterrender', function(comp) {
            comp.el.on('click', function(event, el) {
                if (!el.classList.contains('button')) {
                    me.onClickElement(me.record);
                }
            });
        });

        me.items = me.loadRecord(me.record);

        me.callParent(arguments);

        event = me.getPluginReloadedEventName(me.record);
        Shopware.app.Application.on(event, function(updated) {
            me.removeAll();
            me.add(me.loadRecord(updated));
            me.hideLoadingMask();
        });

    },

    onClickElement: function(record) {
        var me = this;
        me.displayPluginEvent(record);
    },

    loadRecord: function(plugin) {
        var me = this;

        me.record = plugin;

        try {
            if (plugin.allowDummyUpdate()) {
                me.addCls('dummy');
            } else if (me.hasCls('dummy')) {
                me.removeCls('dummy');
            }
        } catch (e) { }

        return [
            me.createBadges(),
            me.createRating(),
            me.createImage(),
            {
                xtype: 'container',
                cls: 'right-side',
                items: [
                    {
                        xtype: 'container',
                        cls: 'meta-information',
                        items: [
                            me.createName(),
                            me.createAuthor(),
                            me.createCertified()
                        ]
                    },
                    me.createButton()
                ]
            }
        ];
    },

    createCertified: function() {
        var me = this;

        if (!me.record.get('certified')) {
            return null;
        }

        return Ext.create('Ext.Component', {
            cls: 'certified',
            html: '<span class="icon">&nbsp;</span><span class="text">{s name="certified"}{/s}</span>'
        });
    },

    createName: function() {
        var me = this,
            name = me.record.get('label');

        return Ext.create('Ext.Component', {
            cls: 'name',
            html: Ext.util.Format.ellipsis(name, 40)
        });
    },

    createImage: function() {
        var me = this;

        return Ext.create('Ext.Component', {
            cls: 'image',
            html: '<img src="' + me.record.get('iconPath') + '" />'
        })
    },

    createAuthor: function() {
        var me = this;

        if (!me.record['getProducerStore']) {
            return null;
        }

        var producer = me.record['getProducerStore'].first();

        return Ext.create('Ext.Component', {
            cls: 'author',
            html: '<span class="prefix">' + '{s name="plugin_author_from"}{/s}' + '</span> ' + Ext.util.Format.ellipsis(producer.get('name'), 25)
        });
    },


    createRating: function() {
        var me = this;

        if (me.record.get('rating') <= 0) {
            return;
        }

        return Ext.create('Ext.Component', {
            cls: 'store-plugin-rating star' + me.record.get('rating'),
            html: '&nbsp;'
        });
    },

    createBadges: function() {
        var me = this, items = [];

        var template = '' +
            '<div class="badge-circle">' +
                '<span class="badge-image">&nbsp;</span>' +
            '</div>' +
            '<div class="badge-text">';

        if (me.record.get('id')) {
            items.push({
                cls: 'installed badge',
                html: template + 'v '+ me.record.get('version') +'</div>'
            });
        }

        if (me.record.allowUpdate()) {
            items.push({
                cls: 'update badge',
                html: template + '{s name="update"}{/s}</div>'
            });
        }

        return Ext.create('Ext.container.Container', {
            cls: 'badge-container',
            defaults: {
                xtype: 'component'
            },
            items: items
        });
    },

    createButton: function() {
        var me = this, cls, text;

        switch(true) {
            case me.record.allowDummyUpdate():

                return Ext.create('PluginManager.container.Container', {
                    cls: 'button dummy',
                    html: '{s name="install"}{/s}',
                    handler: function() {
                        me.registerConfigRequiredEvent(me.record);
                        me.updateDummyPluginEvent(me.record);
                    }
                });

            case me.record.allowUpdate():
                return Ext.create('PluginManager.container.Container', {
                    cls: 'button update',
                    html: '{s name="update_plugin"}{/s}',
                    handler: function() {
                        me.updatePluginEvent(me.record);
                    }
                });

            case me.record.allowInstall():
                return Ext.create('PluginManager.container.Container', {
                    cls: 'button install',
                    html: '{s name="install"}{/s}',
                    handler: function() {
                        me.registerConfigRequiredEvent(me.record);
                        me.installPluginEvent(me.record);
                    }
                });

            case me.record.allowActivate():
                return Ext.create('PluginManager.container.Container', {
                    cls: 'button activate',
                    html: '{s name="activate"}{/s}',
                    handler: function() {
                        me.activatePluginEvent(me.record);
                    }
                });

            case me.record.allowConfigure():
                return Ext.create('PluginManager.container.Container', {
                    cls: 'button configure',
                    html: '{s name="configure"}{/s}',
                    handler: function() {
                        me.displayPluginEvent(me.record);
                    }
                });

            case me.record.isAdvancedFeature():
            case me.record.isLocalPlugin():
                return Ext.create('PluginManager.container.Container', {
                    cls: 'button locale',
                    html: '{s name="open"}{/s}',
                    handler: function() {
                        me.displayPluginEvent(me.record);
                    }
                });


            case me.record.get('useContactForm'):
                return Ext.create('PluginManager.container.Container', {
                    cls: 'button contact-form',
                    html: '{s name="request"}{/s}',
                    handler: function() {
                        var link = '{s name="contact_link"}{/s}?technicalName=' + me.record.get('technicalName');
                        window.open(link);
                    }
                });

            default:
                if (me.record['getPricesStore']) {
                    var prices = me.record['getPricesStore'];
                    var buyPrice = me.getPriceByType(prices, 'buy');
                    var rentPrice = me.getPriceByType(prices, 'rent');

                    if (rentPrice) {
                        text = '{s name="from_price"}{/s} ' + Ext.util.Format.currency(rentPrice.get('price'), ' €', 2, true);
                        cls  = 'rent';
                    } else if (buyPrice) {
                        text = Ext.util.Format.currency(buyPrice.get('price'), ' €', 2, true);
                        cls = 'buy';
                    } else {
                        text = '{s name="free_price"}{/s}';
                        cls  = 'free';
                    }
                }
                break;
        }

        return Ext.create('PluginManager.container.Container', {
            cls: 'button ' + cls,
            html: text,
            handler: function() {
                me.displayPluginEvent(me.record);
            }
        });
    },

    getPriceByType: function(prices, type) {
        var me = this, price = null;

        prices.each(function(item) {
            if (item.get('type') == type) {
                price = item;
            }
        });
        return price;
    }

});