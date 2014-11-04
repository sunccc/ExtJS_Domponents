var sm;

$(document).ready(init);

//初始化方法
function init(){
	sm=new Ext.grid.CheckboxSelectionModel();
	//定义store
	 gridStore = new Ext.data.Store({ 
	 	    autoLoad:true,
			remoteSort:true,//远程排序，默认false，为本地排序
			proxy:new Ext.data.HttpProxy({
				url:ctx+"/dynasearch/ExtQuery/getData.do?queryid=fwfgl"
			}),
			autoLoad:false,
			reader:new Ext.qy.cx.JsonReader({  
				fields:['FWF_ID','KH_ID','KH_SH','KH_MC','CP_MC','SFRQ','FWF_TYPE_MC','SFR','SFRMC','SFJE','YFWZR','XFWZR','HTH','HTRQ','FPHM']  
			})
		}
	);
		//定义分页工具栏
	pageBar = new Ext.PagingToolbar({
			id:'pageBar',
			store:gridStore,  
			pageSize:30, 
        	displayInfo:true, 
        	displayMsg:'显示第{0}条到{1}条记录，一共{2}条' 
	});
	
	 grid = new Ext.grid.GridPanel({
		region:"center",
		id:'gridPanel',
		renderTo:"fwfxx",
		width:document.documentElement.clientWidth-50,	
		height:document.documentElement.clientHeight-80,
		store:gridStore,
		autoScroll:true,
		frame:false,
		sm:sm,
		bbar:pageBar,//将分页工具栏放置在底部，放在顶部配置名称为tbar
		colModel: new Ext.grid.ColumnModel({
			columns:[ 			    
				new Ext.grid.RowNumberer({
				}),
				sm,
				{header:'客户税号',dataIndex:'KH_SH', menuDisabled:true,align:'left',width:120},
				{header:'客户名称',dataIndex:'KH_MC', menuDisabled:true,align:'left',width:140,renderer:linkKHMC},
				{header:'产品',dataIndex:'CP_MC', menuDisabled:true,align:'left',width:120},
				{header:'收费类型',dataIndex:'FWF_TYPE_MC', menuDisabled:true,align:'left',width:60},
				{header:'收费人',dataIndex:'SFRMC', menuDisabled:true,align:'left',width:80},
				{header:'收费金额',dataIndex:'SFJE', menuDisabled:true,align:'right',width:80,renderer:function(value,meta,record){
					return parseFloat(value).toFixed(2);
				}},
				{header:'收费日期',dataIndex:'SFRQ', menuDisabled:true,align:'center',width:100},
				{header:'合同号',dataIndex:'HTH', menuDisabled:true,align:'left',width:100},
				{header:"操作",dataIndex:"",width:100,align:'center',renderer:linkOption}
			]
		}),
		viewConfig: 
		{forceFit: true},
		stripeRows:true,
		loadMask:true,//store加载时是否形成遮罩，默认false
		autoScroll:true,
		listeners:{
		 "rowdblclick":function(grid){
				var record = grid.getSelectionModel().getSelected();
				showDetail(record.data["FWF_ID"]);
			}
		}
	});	
	

	
	 /************************收费人*************************************/		 
     var treeStore4 = new Ext.data.SimpleStore({
  	    	fields : [],
  	    	data : [[]]
      });
  	var rootNode4 = new Ext.tree.AsyncTreeNode({ id: ""+currentSwjg, text: ''+currentSwjgMC,  expanded: false,type:0 });	
      var treeComboBox4 = new Ext.form.ComboBox({
      	fieldLabel:'收费人',
      	id:'cboSFR',
      	anchor:'100%',
      	triggerAction:"all",
      	tpl:'<div id="tree_div4" style="height:200px"></div>',
      	listWidth:250, 
      	listeners:{
      		select:function(combo,record,index)
  			    	 {
  			    			tree.render('tree_div4');   
  			    	}	
      	},
      	mode:'local',
      	store:treeStore4
      });
      //实例化一棵树
      var tree4 = new Ext.tree.TreePanel({
      	border:false,//因为该树面板是渲染在ComboBox组件内部而不是面板，所以将边框去掉
      	animate:false,//取消动画过渡（个人喜好）
      	root: rootNode4,
      	loader: new Ext.tree.TreeLoader({ dataUrl: ctx + '/system/Org/listForOrgAndUser.do'})

      });
      //设置tree的单击事件
      tree4.on('click',function(node){
      	if(node.attributes.type==0){
      		return;
      	}
      	treeComboBox4.setValue(node.text);//为下拉框赋值
      	Ext.getCmp("cxformPanel").getForm().findField('hiddenSFR').setValue(node.id);//将树节点对应的id值保存在一个隐藏域中，提交表单时使用
      	tree4.render('tree_div4');//此处仍然需要渲染树面板，不然树面板会在点击后消失
      });
      //设置当树下拉框展开时将树面板渲染到指定div中
     treeComboBox4.on('expand',function(){
     		tree4.render('tree_div4');
     });	
	cxForm = new Ext.form.FormPanel({
			width:800,
			id:"cxformPanel",
			autoHeight:true,
			border:false,
			frame:false,
			layout:"form",
			autoScroll:true,
			style:"padding:5px",
			items:[
				new Ext.Panel({
					layout:"column",
					anchor:"100%",
					border:false,
					defaults:{
						border:false					
					},
					items:[
					{
						columnWidth:1/3,
						layout:"form",
						labelWidth:70,
						labelAlign:"right",
						defaults:{
							anchor:"100%"
						},
						items:[
						    new Ext.form.TextField({
								fieldLabel:"客户税号",
								name:"KH_SH",
								id:"KH_SH"
							}),
							new Ext.form.DateField({   
						        name:'SFRQQ',
						        id:"SFRQQ",
								fieldLabel:'收费日期',
						        format:'Y-m-d',   
						        anchor:'100%'
							}),
							treeComboBox4,
							new Ext.form.Hidden({
								id:"hiddenSFR",
								name:"SFR"
							})
						]
					},
					{
						columnWidth:1/3,
						layout:"form",
						labelWidth:70,
						labelAlign:"right",					
						defaults:{
							anchor:"100%"
						},
						items:[
						new Ext.form.TextField({
								fieldLabel:"快捷码",
								name:"KH_KJM",
								id:"KH_KJM"
							}),
						new Ext.form.DateField({   
						        name:'SFRQZ',
						        id:"SFRQZ",
								fieldLabel:'至',
						        format:'Y-m-d',   
						        anchor:'100%'
							})						 
						]
					},
					{
						columnWidth:1/3,
						layout:"form",
						labelWidth:70,
						labelAlign:"right",					
						defaults:{
							anchor:"100%"
						},
						items:[
							new Ext.form.TextField({
								fieldLabel:"客户名称",
								name:"KH_MC",
								id:"KH_MC"
							}),
							new Ext.form.ComboBox({
								fieldLabel:"收费类型",
								triggerAction:"all",
								mode:"local",
								hiddenName:"FWF_TYPE",
								displayField:"MC",
								valueField:"DM",
								id:"cboFWF_TYPE",
								store:new Ext.data.SimpleStore({
									fields:["DM","MC"],
									data:[["01",'上门收取'],["02",'客户自交']]  
								})
							})	
						]
					}					
				]
			})
		],
		buttonAlign:"right",
		buttons:[
			{
				text:"查询",
				handler:cx
			},
			{
				text:"重置",
				handler:function(){
					cxForm.form.reset();
				}
			}
		],
		keys:[{ //处理键盘回车事件     
            key:Ext.EventObject.ENTER,     
            fn:cx,     
            scope:this    
      	  }]
	});		
	cxWin = new Ext.Window({
		width:700,
		resizable:false,
		autoHeight:true,
		title:"收费信息查询",
		layout:"fit",
		bodyStyle:"background-color:#fff",
		closeAction:"hide",
		buttonAlign:"center",
		items:[
			cxForm
		]
	});
	
	Ext.EventManager.onWindowResize(function(){
		grid.setWidth(document.documentElement.clientWidth-50);
	});
	
	loadStore(null, 'gridPanel', 'pageBar');
	
}  
//查询
function cx(){
	if(Ext.getCmp("cboSFR").getValue()==""){
		Ext.getCmp("hiddenSFR").setValue("");
	}
	cxWin.hide();
	ComboValueCheck(cxForm);	
	var s = cxForm.getForm().getValues();
	loadStore(s, 'gridPanel', 'pageBar');
}
//操作
function linkOption(value,meta,record){
	return "<a href=javascript:showDetail('"+record.data['FWF_ID']+"')>查看</a>&nbsp;<a href=javascript:modify('"+record.data['FWF_ID']+"')>修改</a>";
}
//查看客户信息
function linkKHMC(value,meta,record){
  return "<a title='"+value+"' href=javascript:showKhDetail('"+record.data['KH_ID']+"')>"+value+"</a>";
}
function showKhDetail(khid){
	loadPage('ckkhmx'+khid,'客户信息查看',ctx +'/pages/module/khgl/khxxdj.jsp?FLAG=CK&KH_ID='+khid);	
}
function showDetail(fwfid){
	loadPage('ckfwf'+fwfid,'服务费信息查看',ctx +'/pages/module/fwfgl/fwfdj.jsp?FLAG=CK&FWF_ID='+fwfid);	
}
//客户信息修改
function modify(fwfid){
	loadPage('xgfwf'+fwfid,'服务费信息修改',ctx +'/pages/module/fwfgl/fwfdj.jsp?FLAG=XG&FWF_ID='+fwfid);
}
//客户信息删除
function del(){
	var select = sm.getSelections();
	if(select.length==0){
		alert("请选择要修改的记录！");
	}else{
		if(confirm("确定删除？")){
			for(var i=0;i<select.length;i++){
				var result = doService("common.Common.commonDelete","sqlid","fwfgl","FWF_ID",select[i].data["FWF_ID"]);
			}
			if(result){
				alert("删除成功！");
				cxWin.show();
				cx();
			}
		}
	}
}
