import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BlockedlistPage } from './blockedlist';

@NgModule({
  declarations: [
    BlockedlistPage,
  ],
  imports: [
    IonicPageModule.forChild(BlockedlistPage),
  ],
})
export class BlockedlistPageModule {}
