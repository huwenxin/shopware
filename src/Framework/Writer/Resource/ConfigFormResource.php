<?php declare(strict_types=1);

namespace Shopware\Framework\Write\Resource;

use Shopware\Context\Struct\TranslationContext;
use Shopware\Framework\Write\Field\FkField;
use Shopware\Framework\Write\Field\IntField;
use Shopware\Framework\Write\Field\LongTextField;
use Shopware\Framework\Write\Field\ReferenceField;
use Shopware\Framework\Write\Field\StringField;
use Shopware\Framework\Write\Field\SubresourceField;
use Shopware\Framework\Write\Field\TranslatedField;
use Shopware\Framework\Write\Field\UuidField;
use Shopware\Framework\Write\Flag\Required;
use Shopware\Framework\Write\Resource;

class ConfigFormResource extends Resource
{
    protected const UUID_FIELD = 'uuid';
    protected const NAME_FIELD = 'name';
    protected const LABEL_FIELD = 'label';
    protected const DESCRIPTION_FIELD = 'description';
    protected const POSITION_FIELD = 'position';

    public function __construct()
    {
        parent::__construct('config_form');

        $this->primaryKeyFields[self::UUID_FIELD] = (new UuidField('uuid'))->setFlags(new Required());
        $this->fields[self::NAME_FIELD] = (new StringField('name'))->setFlags(new Required());
        $this->fields[self::LABEL_FIELD] = (new StringField('label'))->setFlags(new Required());
        $this->fields[self::DESCRIPTION_FIELD] = new LongTextField('description');
        $this->fields[self::POSITION_FIELD] = new IntField('position');
        $this->fields['parent'] = new ReferenceField('parentUuid', 'uuid', \Shopware\Framework\Write\Resource\ConfigFormResource::class);
        $this->fields['parentUuid'] = (new FkField('parent_uuid', \Shopware\Framework\Write\Resource\ConfigFormResource::class, 'uuid'));
        $this->fields['plugin'] = new ReferenceField('pluginUuid', 'uuid', \Shopware\Framework\Write\Resource\PluginResource::class);
        $this->fields['pluginUuid'] = (new FkField('plugin_uuid', \Shopware\Framework\Write\Resource\PluginResource::class, 'uuid'));
        $this->fields[self::LABEL_FIELD] = new TranslatedField('label', \Shopware\Shop\Writer\Resource\ShopResource::class, 'uuid');
        $this->fields[self::DESCRIPTION_FIELD] = new TranslatedField('description', \Shopware\Shop\Writer\Resource\ShopResource::class, 'uuid');
        $this->fields['translations'] = new SubresourceField(\Shopware\Framework\Write\Resource\ConfigFormTranslationResource::class, 'languageUuid');
        $this->fields['parent'] = new SubresourceField(\Shopware\Framework\Write\Resource\ConfigFormResource::class);
        $this->fields['fields'] = new SubresourceField(\Shopware\Framework\Write\Resource\ConfigFormFieldResource::class);
    }

    public function getWriteOrder(): array
    {
        return [
            \Shopware\Framework\Write\Resource\ConfigFormResource::class,
            \Shopware\Framework\Write\Resource\PluginResource::class,
            \Shopware\Framework\Write\Resource\ConfigFormTranslationResource::class,
            \Shopware\Framework\Write\Resource\ConfigFormFieldResource::class,
        ];
    }

    public static function createWrittenEvent(array $updates, TranslationContext $context, array $errors = []): \Shopware\Framework\Event\ConfigFormWrittenEvent
    {
        $event = new \Shopware\Framework\Event\ConfigFormWrittenEvent($updates[self::class] ?? [], $context, $errors);

        unset($updates[self::class]);

        if (!empty($updates[\Shopware\Framework\Write\Resource\ConfigFormResource::class])) {
            $event->addEvent(\Shopware\Framework\Write\Resource\ConfigFormResource::createWrittenEvent($updates, $context));
        }

        if (!empty($updates[\Shopware\Framework\Write\Resource\PluginResource::class])) {
            $event->addEvent(\Shopware\Framework\Write\Resource\PluginResource::createWrittenEvent($updates, $context));
        }

        if (!empty($updates[\Shopware\Framework\Write\Resource\ConfigFormResource::class])) {
            $event->addEvent(\Shopware\Framework\Write\Resource\ConfigFormResource::createWrittenEvent($updates, $context));
        }

        if (!empty($updates[\Shopware\Framework\Write\Resource\ConfigFormTranslationResource::class])) {
            $event->addEvent(\Shopware\Framework\Write\Resource\ConfigFormTranslationResource::createWrittenEvent($updates, $context));
        }

        if (!empty($updates[\Shopware\Framework\Write\Resource\ConfigFormResource::class])) {
            $event->addEvent(\Shopware\Framework\Write\Resource\ConfigFormResource::createWrittenEvent($updates, $context));
        }

        if (!empty($updates[\Shopware\Framework\Write\Resource\ConfigFormFieldResource::class])) {
            $event->addEvent(\Shopware\Framework\Write\Resource\ConfigFormFieldResource::createWrittenEvent($updates, $context));
        }

        return $event;
    }
}
