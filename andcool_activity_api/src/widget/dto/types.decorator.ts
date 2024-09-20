import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { display_orders } from '../widget.controller';


@ValidatorConstraint({ async: false })
export class IsSortConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        return display_orders.includes(value);
    }

    defaultMessage(args: ValidationArguments) {
        return `\`${args.property}\` property must have one of [${display_orders.join(', ')}] values, but \`${args.value}\` was provided instead`;
    }
}


export function IsSort(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsSortConstraint
        });
    };
}