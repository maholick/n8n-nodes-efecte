import { INodeExecutionData, INodeType, INodeTypeDescription, IPollFunctions } from 'n8n-workflow';
export declare class EfecteEsmTrigger implements INodeType {
    description: INodeTypeDescription;
    poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null>;
}
