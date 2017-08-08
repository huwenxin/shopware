<?php declare(strict_types=1);

namespace Shopware\Product\Writer\Field\ProductConfiguratorSetOptionRelation;

use Shopware\Framework\Validation\ConstraintBuilder;
use Shopware\Product\Writer\Api\IntField;

class OptionIdField extends IntField
{
    public function __construct(ConstraintBuilder $constraintBuilder)
    {
        parent::__construct('optionId', 'option_id', 'product_configurator_set_option_relation', $constraintBuilder);
    }
}